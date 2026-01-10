# PLAN REFINADO FINAL: VALIDACION EJERCICIOS M3-M5

**Fecha**: 2026-01-08
**Estado**: APROBADO PARA EJECUCION
**Version**: 1.0

---

## RESUMEN EJECUTIVO

Este documento consolida el plan final de implementacion basado en:
- ANALISIS-VALIDACION-EJERCICIOS-M3-M5-2026-01-08.md
- PLAN-IMPLEMENTACION-VALIDACION-M3-M5-2026-01-08.md
- VALIDACION-PLAN-VALIDACION-M3-M5-2026-01-08.md
- ANALISIS-DEPENDENCIAS-M3-M5-2026-01-08.md

---

## TAREAS DE IMPLEMENTACION

### TAREA 1: Migracion de Base de Datos

**Archivo a crear**: `/apps/backend/src/database/migrations/1704700000000-add-submitted-progress.ts`

**Contenido exacto**:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmittedProgress1704700000000 implements MigrationInterface {
  name = 'AddSubmittedProgress1704700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar nuevas columnas
    await queryRunner.query(`
      ALTER TABLE progress_tracking.module_progress
      ADD COLUMN IF NOT EXISTS submitted_exercises INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS graded_exercises INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS submitted_progress_percentage DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS graded_progress_percentage DECIMAL(5,2) DEFAULT 0;
    `);

    // 2. Migrar datos: completed_exercises -> graded_exercises
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress
      SET
        graded_exercises = completed_exercises,
        graded_progress_percentage = progress_percentage;
    `);

    // 3. Calcular submitted_exercises desde submissions
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress mp
      SET
        submitted_exercises = COALESCE((
          SELECT COUNT(DISTINCT es.exercise_id)
          FROM progress_tracking.exercise_submissions es
          JOIN educational_content.exercises e ON e.id = es.exercise_id
          WHERE es.user_id = mp.user_id
            AND e.module_id = mp.module_id
            AND es.status IN ('submitted', 'graded', 'reviewed')
        ), graded_exercises),
        submitted_progress_percentage = CASE
          WHEN mp.total_exercises > 0 THEN
            LEAST(100, ROUND(
              (COALESCE((
                SELECT COUNT(DISTINCT es.exercise_id)
                FROM progress_tracking.exercise_submissions es
                JOIN educational_content.exercises e ON e.id = es.exercise_id
                WHERE es.user_id = mp.user_id
                  AND e.module_id = mp.module_id
                  AND es.status IN ('submitted', 'graded', 'reviewed')
              ), graded_exercises)::numeric / mp.total_exercises) * 100, 2
            ))
          ELSE graded_progress_percentage
        END;
    `);

    // 4. Actualizar progress_percentage para usar submitted
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress
      SET progress_percentage = submitted_progress_percentage
      WHERE submitted_progress_percentage > 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress
      SET progress_percentage = graded_progress_percentage;
    `);

    await queryRunner.query(`
      ALTER TABLE progress_tracking.module_progress
      DROP COLUMN IF EXISTS submitted_exercises,
      DROP COLUMN IF EXISTS graded_exercises,
      DROP COLUMN IF EXISTS submitted_progress_percentage,
      DROP COLUMN IF EXISTS graded_progress_percentage;
    `);
  }
}
```

---

### TAREA 2: Modificar Entidad ModuleProgress

**Archivo**: `/apps/backend/src/modules/progress/entities/module-progress.entity.ts`

**Insertar despues de linea 105** (despues de skipped_exercises):
```typescript
  // =====================================================
  // SUBMITTED vs GRADED TRACKING (M3-M5 Feature)
  // =====================================================

  /**
   * Ejercicios enviados (pendientes o ya validados)
   * Incluye: submitted, graded, reviewed
   * Se actualiza al ENVIAR, no al calificar
   */
  @Column({ type: 'integer', default: 0 })
  submitted_exercises!: number;

  /**
   * Ejercicios calificados por el maestro
   * Solo incluye: graded, reviewed
   * Se actualiza cuando el maestro califica
   */
  @Column({ type: 'integer', default: 0 })
  graded_exercises!: number;

  /**
   * Porcentaje de progreso basado en envios
   * Usado para la barra de progreso visual
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  submitted_progress_percentage!: number;

  /**
   * Porcentaje de progreso basado en calificaciones
   * Usado para calculos de recompensas
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  graded_progress_percentage!: number;
```

---

### TAREA 3: Modificar ExerciseSubmissionService

**Archivo**: `/apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Paso 3.1**: Agregar metodo (al final de la clase, antes del cierre):
```typescript
  /**
   * Actualiza el progreso del modulo cuando se ENVIA un ejercicio
   * @param userId - ID del usuario
   * @param exerciseId - ID del ejercicio
   */
  private async updateModuleProgressOnSubmission(
    userId: string,
    exerciseId: string,
  ): Promise<void> {
    try {
      // 1. Obtener module_id
      const exercise = await this.exerciseRepo.findOne({
        where: { id: exerciseId },
        select: ['id', 'module_id'],
      });

      if (!exercise?.module_id) {
        this.logger.warn(`[updateModuleProgressOnSubmission] Exercise ${exerciseId} has no module_id`);
        return;
      }

      const moduleId = exercise.module_id;

      // 2. Contar ejercicios enviados unicos
      const submittedResult = await this.entityManager.query(`
        SELECT COUNT(DISTINCT es.exercise_id) as count
        FROM progress_tracking.exercise_submissions es
        JOIN educational_content.exercises e ON e.id = es.exercise_id
        WHERE es.user_id = $1
          AND e.module_id = $2
          AND es.status IN ('submitted', 'graded', 'reviewed')
      `, [userId, moduleId]);

      const submittedExercises = parseInt(submittedResult[0]?.count || '0', 10);

      // 3. Obtener total de ejercicios
      const totalExercises = await this.exerciseRepo.count({
        where: { module_id: moduleId, is_active: true },
      });

      if (totalExercises === 0) {
        this.logger.warn(`[updateModuleProgressOnSubmission] Module ${moduleId} has no active exercises`);
        return;
      }

      // 4. Calcular porcentaje (max 100)
      const submittedPercentage = Math.min(
        100,
        Math.round((submittedExercises / totalExercises) * 100 * 100) / 100
      );

      // 5. Determinar status
      let newStatus: string;
      if (submittedPercentage >= 100) {
        newStatus = 'completed';
      } else if (submittedPercentage > 0) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'not_started';
      }

      // 6. UPSERT module_progress
      await this.entityManager.query(`
        INSERT INTO progress_tracking.module_progress (
          user_id, module_id, status, progress_percentage,
          submitted_exercises, submitted_progress_percentage,
          total_exercises, started_at, last_accessed_at
        ) VALUES (
          $1, $2, $3::progress_tracking.progress_status, $4, $5, $4, $6,
          NOW(), NOW()
        )
        ON CONFLICT (user_id, module_id) DO UPDATE SET
          status = CASE
            WHEN progress_tracking.module_progress.status = 'mastered' THEN 'mastered'
            WHEN progress_tracking.module_progress.status = 'reviewed' THEN 'reviewed'
            ELSE $3::progress_tracking.progress_status
          END,
          progress_percentage = $4,
          submitted_exercises = $5,
          submitted_progress_percentage = $4,
          total_exercises = $6,
          last_accessed_at = NOW(),
          updated_at = NOW()
      `, [userId, moduleId, newStatus, submittedPercentage, submittedExercises, totalExercises]);

      this.logger.log(
        `[updateModuleProgressOnSubmission] User ${userId}, Module ${moduleId}: ` +
        `${submittedExercises}/${totalExercises} (${submittedPercentage}%) - ${newStatus}`
      );

    } catch (error) {
      this.logger.error(`[updateModuleProgressOnSubmission] Error: ${error}`);
      // No throw - no debe bloquear el envio
    }
  }
```

**Paso 3.2**: Modificar submitExercise() - buscar donde dice "// Notificar al docente" (aprox linea 370) e insertar ANTES:
```typescript
      // FEATURE M3-M5: Actualizar progreso del modulo al enviar
      // El progreso se actualiza inmediatamente, las recompensas al calificar
      await this.updateModuleProgressOnSubmission(userId, exerciseId);
```

---

### TAREA 4: Modificar FeedbackModal

**Archivo**: `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`

**Paso 4.1**: Agregar import de Clock (linea 3):
```typescript
import { CheckCircle2, XCircle, Info, Trophy, Sparkles, Clock } from 'lucide-react';
```

**Paso 4.2**: Agregar seccion de pendingReview despues del score display (linea ~202, antes de los botones):
```typescript
                {/* Seccion de Pendiente de Validacion */}
                {feedback.pendingReview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Tu progreso ha sido actualizado
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Tu trabajo ha sido enviado y esta en espera de validacion por tu maestro.
                          La barra de progreso del modulo ya refleja este avance.
                        </p>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <strong>Nota:</strong> Las recompensas (XP, ML Coins) se asignaran
                            cuando tu maestro complete la evaluacion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
```

---

### TAREA 5: Actualizar Tipos de Progreso (Frontend)

**Archivo**: `/apps/frontend/src/features/progress/api/progressTypes.ts`

**Agregar campos a ModuleProgressSummary**:
```typescript
export interface ModuleProgressSummary {
  moduleId: string;
  moduleName: string;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  averageScore: number;
  timeSpent: number;
  lastActivityAt: Date;
  // NUEVOS CAMPOS - M3-M5 Feature
  submittedExercises?: number;
  gradedExercises?: number;
  submittedProgressPercentage?: number;
  gradedProgressPercentage?: number;
}
```

---

### TAREA 6: Verificar Ejercicios M3-M5

**Verificar que cada ejercicio**:
1. Detecte `response.status === 'pending_review'`
2. Use `pendingReview: true` en feedback
3. Llame a `syncAndInvalidate()`

**Archivos a verificar** (solo lectura y confirmacion):
- [ ] MatrizPerspectivasExercise.tsx (M3) - REFERENCIA
- [ ] TribunalOpinionesExercise.tsx (M3)
- [ ] AnalisisFuentesExercise.tsx (M3)
- [ ] PodcastArgumentativoExercise.tsx (M3)
- [ ] DebateDigitalExercise.tsx (M3)
- [ ] AnalisisMemesExercise.tsx (M4)
- [ ] VerificadorFakeNewsExercise.tsx (M4)
- [ ] QuizTikTokExercise.tsx (M4)
- [ ] InfografiaInteractivaExercise.tsx (M4)
- [ ] NavegacionHipertextualExercise.tsx (M4)
- [ ] ComicDigitalExercise.tsx (M5)
- [ ] DiarioMultimediaExercise.tsx (M5)
- [ ] VideoCartaExercise.tsx (M5)

---

## ORDEN DE EJECUCION

```
PASO 1: Crear migracion (TAREA 1)
   └── Ejecutar: npm run migration:run

PASO 2: Modificar entidad (TAREA 2)
   └── Verificar compilacion TypeScript

PASO 3: Modificar servicio (TAREA 3)
   └── Verificar compilacion backend

PASO 4: Modificar tipos frontend (TAREA 5)
   └── Verificar compilacion frontend

PASO 5: Modificar FeedbackModal (TAREA 4)
   └── Verificar compilacion frontend

PASO 6: Verificar ejercicios (TAREA 6)
   └── Confirmar patron consistente

PASO 7: Probar flujo completo
   └── Enviar ejercicio M3-M5
   └── Verificar progreso actualizado
   └── Verificar modal muestra mensaje correcto
   └── Verificar XP no asignado hasta validacion
```

---

## CHECKLIST DE VALIDACION POST-IMPLEMENTACION

- [ ] Migracion ejecutada sin errores
- [ ] Backend compila sin errores
- [ ] Frontend compila sin errores
- [ ] Progreso se actualiza al enviar ejercicio
- [ ] Modal muestra mensaje de "pendiente de validacion"
- [ ] Modal muestra seccion informativa con icono Clock
- [ ] XP/ML Coins NO se asignan al enviar
- [ ] XP/ML Coins SI se asignan al calificar
- [ ] Barra de progreso refleja ejercicios enviados
- [ ] Todos los 13 ejercicios M3-M5 funcionan igual

---

## NOTAS FINALES

1. **Retrocompatibilidad**: Todos los campos existentes se mantienen
2. **Sin downtime**: La migracion es no-destructiva
3. **Rollback**: La migracion tiene down() funcional
4. **Impacto minimo**: Solo afecta flujo M3-M5

---

**Plan refinado por**: Claude (Arquitecto/Lead Developer)
**Fecha**: 2026-01-08
**Estado**: LISTO PARA EJECUCION
