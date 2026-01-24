# PLAN DE IMPLEMENTACION: VALIDACION DE EJERCICIOS M3-M5

**Fecha**: 2026-01-08
**Estado**: EN PLANEACION
**Documento de Referencia**: ANALISIS-VALIDACION-EJERCICIOS-M3-M5-2026-01-08.md
**Tipo**: Feature Enhancement

---

## 1. RESUMEN DEL ALCANCE

### 1.1 Objetivos
1. Actualizar progreso del modulo al ENVIAR ejercicios (no solo al validar)
2. Mostrar mensaje diferenciado en modal para ejercicios pendientes de validacion
3. Mantener consistencia en todos los ejercicios M3-M5
4. Separar logica de "avance" de logica de "recompensas"

### 1.2 Fuera de Alcance
- Cambios al sistema de XP/ML Coins/Rango (se mantiene igual)
- Cambios al flujo de validacion del maestro
- Modificaciones a ejercicios de M1-M2 (auto-corregibles)

---

## 2. ARQUITECTURA DE LA SOLUCION

### 2.1 Modelo de Datos Propuesto

```
ModuleProgress
├── completed_exercises (existente) -> renombrar a graded_exercises
├── submitted_exercises (NUEVO) -> ejercicios enviados
├── total_exercises (existente)
├── progress_percentage (existente) -> basado en submitted
├── graded_progress_percentage (NUEVO) -> basado en graded
└── status (existente) -> basado en submitted
```

### 2.2 Flujo de Actualizacion

```
┌──────────────────────────────────────────────────────────────┐
│  ESTUDIANTE ENVIA EJERCICIO                                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  submitExercise()                                             │
│    ├─> Crear/actualizar submission (status = 'submitted')     │
│    ├─> updateModuleProgressOnSubmission() [NUEVO]            │
│    │     ├─> submitted_exercises++                           │
│    │     ├─> progress_percentage = (submitted/total)*100     │
│    │     └─> status = in_progress | completed                │
│    └─> Retornar submission                                    │
│                                                                │
│  FRONTEND recibe response:                                     │
│    ├─> Detecta requiresManualReview = true                   │
│    ├─> Muestra modal tipo 'info' con mensaje actualizado     │
│    ├─> Barra de progreso YA actualizada (via invalidacion)   │
│    └─> NO muestra XP/ML Coins (pendiente)                    │
│                                                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  MAESTRO VALIDA EJERCICIO                                     │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  gradeSubmission()                                            │
│    ├─> Actualizar submission (status = 'graded')              │
│    ├─> claimRewards()                                         │
│    │     ├─> Calcular XP/ML Coins                            │
│    │     ├─> Actualizar user_stats                           │
│    │     ├─> updateModuleProgressOnGrading() [MODIFICADO]    │
│    │     │     ├─> graded_exercises++                        │
│    │     │     └─> graded_progress_percentage = ...          │
│    │     └─> Detectar achievements/rank up                    │
│    └─> Notificar estudiante                                   │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. TAREAS DE IMPLEMENTACION

### FASE A: MIGRACION DE BASE DE DATOS

#### A.1 Crear Migracion
**Archivo**: `/apps/backend/src/database/migrations/XXXXXX-add-submitted-progress.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmittedProgress1704700000000 implements MigrationInterface {
  name = 'AddSubmittedProgress1704700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar nuevas columnas
    await queryRunner.query(`
      ALTER TABLE progress_tracking.module_progress
      ADD COLUMN IF NOT EXISTS submitted_exercises INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS graded_exercises INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS submitted_progress_percentage DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS graded_progress_percentage DECIMAL(5,2) DEFAULT 0;
    `);

    // Migrar datos existentes: completed_exercises -> graded_exercises
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress
      SET
        graded_exercises = completed_exercises,
        graded_progress_percentage = progress_percentage;
    `);

    // Calcular submitted_exercises desde submissions existentes
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
        submitted_progress_percentage = COALESCE(
          CASE
            WHEN total_exercises > 0 THEN
              ((SELECT COUNT(DISTINCT es.exercise_id)
                FROM progress_tracking.exercise_submissions es
                JOIN educational_content.exercises e ON e.id = es.exercise_id
                WHERE es.user_id = mp.user_id
                  AND e.module_id = mp.module_id
                  AND es.status IN ('submitted', 'graded', 'reviewed')
              )::float / total_exercises) * 100
            ELSE 0
          END,
          graded_progress_percentage
        );
    `);

    // Actualizar progress_percentage para usar submitted
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress
      SET progress_percentage = submitted_progress_percentage
      WHERE submitted_progress_percentage > 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: restaurar progress_percentage desde graded
    await queryRunner.query(`
      UPDATE progress_tracking.module_progress
      SET progress_percentage = graded_progress_percentage;
    `);

    // Eliminar columnas nuevas
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

**Checklist**:
- [ ] Crear archivo de migracion
- [ ] Probar en entorno local
- [ ] Verificar rollback funciona
- [ ] Documentar cambios

---

### FASE B: MODIFICACIONES EN BACKEND

#### B.1 Modificar Entidad ModuleProgress
**Archivo**: `/apps/backend/src/modules/progress/entities/module-progress.entity.ts`

**Cambios**:
```typescript
// AGREGAR despues de completed_exercises (linea ~50)

/**
 * Ejercicios enviados (pendientes de validacion o ya validados)
 * Cuenta ejercicios unicos con status: submitted, graded, reviewed
 */
@Column({ type: 'int', default: 0 })
submitted_exercises!: number;

/**
 * Ejercicios validados por el maestro (con calificacion)
 * Anteriormente completed_exercises
 */
@Column({ type: 'int', default: 0 })
graded_exercises!: number;

/**
 * Porcentaje de progreso basado en envios
 * Usado para la barra de progreso visual del estudiante
 */
@Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
submitted_progress_percentage!: number;

/**
 * Porcentaje de progreso basado en validaciones
 * Usado para calcular recompensas
 */
@Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
graded_progress_percentage!: number;
```

**Checklist**:
- [ ] Agregar campos a entidad
- [ ] Actualizar decoradores TypeORM
- [ ] Generar tipos actualizados

#### B.2 Modificar ExerciseSubmissionService
**Archivo**: `/apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Cambio 1**: Agregar metodo updateModuleProgressOnSubmission

```typescript
/**
 * Actualiza el progreso del modulo cuando se ENVIA un ejercicio
 * (no cuando se califica). Esto permite que el estudiante vea
 * su progreso inmediatamente al enviar.
 *
 * @param userId - ID del usuario
 * @param exerciseId - ID del ejercicio enviado
 */
private async updateModuleProgressOnSubmission(
  userId: string,
  exerciseId: string,
): Promise<void> {
  try {
    // 1. Obtener module_id del ejercicio
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      select: ['id', 'module_id'],
    });

    if (!exercise?.module_id) {
      this.logger.warn(`Exercise ${exerciseId} has no module_id`);
      return;
    }

    const moduleId = exercise.module_id;

    // 2. Contar ejercicios enviados unicos en el modulo
    const submittedResult = await this.entityManager.query(`
      SELECT COUNT(DISTINCT es.exercise_id) as count
      FROM progress_tracking.exercise_submissions es
      JOIN educational_content.exercises e ON e.id = es.exercise_id
      WHERE es.user_id = $1
        AND e.module_id = $2
        AND es.status IN ('submitted', 'graded', 'reviewed')
    `, [userId, moduleId]);

    const submittedExercises = parseInt(submittedResult[0]?.count || '0', 10);

    // 3. Obtener total de ejercicios del modulo
    const totalExercises = await this.exerciseRepo.count({
      where: { module_id: moduleId, is_active: true },
    });

    if (totalExercises === 0) {
      this.logger.warn(`Module ${moduleId} has no active exercises`);
      return;
    }

    // 4. Calcular porcentaje
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
        status = $3::progress_tracking.progress_status,
        progress_percentage = $4,
        submitted_exercises = $5,
        submitted_progress_percentage = $4,
        total_exercises = $6,
        last_accessed_at = NOW(),
        updated_at = NOW()
    `, [
      userId, moduleId, newStatus, submittedPercentage,
      submittedExercises, totalExercises
    ]);

    this.logger.log(
      `[updateModuleProgressOnSubmission] User ${userId}, Module ${moduleId}: ` +
      `${submittedExercises}/${totalExercises} (${submittedPercentage}%) - ${newStatus}`
    );

  } catch (error) {
    this.logger.error(`Error updating module progress on submission: ${error}`);
    // No lanzar error - no debe bloquear el envio
  }
}
```

**Cambio 2**: Llamar a updateModuleProgressOnSubmission en submitExercise

```typescript
// En submitExercise(), despues de crear/actualizar submission (aprox linea 370)

// NUEVO: Actualizar progreso del modulo al enviar
await this.updateModuleProgressOnSubmission(userId, exerciseId);

// Notificar al docente (existente)
await this.notifyTeacherOfSubmission(submission, exercise, userId);
```

**Cambio 3**: Modificar updateModuleProgressAfterCompletion (en claimRewards)

```typescript
// Renombrar metodo o actualizar para usar graded_exercises
private async updateModuleProgressOnGrading(
  userId: string,
  exerciseId: string,
  xpEarned: number,
  mlCoinsEarned: number,
): Promise<void> {
  // ... logica similar pero actualizando graded_exercises
  // y graded_progress_percentage
}
```

**Checklist**:
- [ ] Agregar metodo updateModuleProgressOnSubmission
- [ ] Modificar submitExercise para llamar al nuevo metodo
- [ ] Modificar updateModuleProgressAfterCompletion para graded
- [ ] Agregar logs para debugging
- [ ] Probar flujo completo

#### B.3 Actualizar DTOs
**Archivo**: `/apps/backend/src/modules/progress/dto/module-progress.dto.ts`

```typescript
export class ModuleProgressDto {
  // ... campos existentes ...

  @ApiProperty({ description: 'Ejercicios enviados (pendientes o validados)' })
  submitted_exercises: number;

  @ApiProperty({ description: 'Ejercicios validados por el maestro' })
  graded_exercises: number;

  @ApiProperty({ description: 'Progreso basado en envios (%)' })
  submitted_progress_percentage: number;

  @ApiProperty({ description: 'Progreso basado en validaciones (%)' })
  graded_progress_percentage: number;
}
```

**Checklist**:
- [ ] Actualizar DTOs
- [ ] Actualizar Swagger docs
- [ ] Verificar serializacion

---

### FASE C: MODIFICACIONES EN FRONTEND

#### C.1 Actualizar Tipos de Progreso
**Archivo**: `/apps/frontend/src/features/progress/api/progressTypes.ts`

```typescript
export interface ModuleProgressSummary {
  moduleId: string;
  moduleName: string;
  totalExercises: number;
  completedExercises: number;
  // NUEVOS CAMPOS
  submittedExercises: number;      // Ejercicios enviados
  gradedExercises: number;          // Ejercicios validados
  submittedProgressPercentage: number;
  gradedProgressPercentage: number;
  // Usar submitted para UI
  progressPercentage: number;       // Basado en submitted
  averageScore: number;
  timeSpent: number;
  lastActivityAt: Date;
}
```

**Checklist**:
- [ ] Agregar nuevos campos a tipos
- [ ] Actualizar mappers/transformers
- [ ] Verificar compatibilidad

#### C.2 Actualizar FeedbackModal
**Archivo**: `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`

**Cambio**: Actualizar mensaje para tipo 'info' (pendiente de validacion)

```typescript
// En el render del mensaje (aprox linea 157-165)
{feedback.pendingReview && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <div className="flex items-start gap-3">
      <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-blue-800 font-medium">
          Tu trabajo ha sido enviado exitosamente
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Esta en espera de validacion por tu maestro. Tu progreso en el
          modulo ya ha sido actualizado. Recibiras XP y ML Coins cuando
          tu maestro evalue tu respuesta.
        </p>
      </div>
    </div>
  </div>
)}
```

**Checklist**:
- [ ] Actualizar componente FeedbackModal
- [ ] Agregar estilos para seccion pendiente
- [ ] Probar visualmente

#### C.3 Actualizar CompletionModal (opcional)
**Archivo**: `/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx`

Si se decide usar CompletionModal en lugar de FeedbackModal para M3-M5:

```typescript
interface CompletionModalProps {
  // ... existentes ...
  requiresManualReview?: boolean;
  validationStatus?: 'pending' | 'graded' | 'reviewed';
}
```

**Checklist**:
- [ ] Evaluar si se usa CompletionModal o FeedbackModal
- [ ] Actualizar props si es necesario
- [ ] Implementar UI para estado pendiente

#### C.4 Verificar Ejercicios M3-M5
**Archivos**: Todos los ejercicios de M3-M5

Para cada ejercicio, verificar que:
1. Detecta `response.status === 'pending_review'`
2. Muestra FeedbackModal con `pendingReview: true`
3. Llama a `syncAndInvalidate()` para actualizar cache
4. NO muestra recompensas cuando pendingReview

**Lista de archivos**:
```
M3:
- /apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx
- /apps/frontend/src/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx
- /apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx
- /apps/frontend/src/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx
- /apps/frontend/src/features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx

M4:
- /apps/frontend/src/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx
- /apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx
- /apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx
- /apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx
- /apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise.tsx

M5:
- /apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx
- /apps/frontend/src/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx
- /apps/frontend/src/features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx
```

**Checklist por ejercicio**:
- [ ] MatrizPerspectivas (M3) - REFERENCIA
- [ ] TribunalOpiniones (M3)
- [ ] AnalisisFuentes (M3)
- [ ] PodcastArgumentativo (M3)
- [ ] DebateDigital (M3)
- [ ] AnalisisMemes (M4)
- [ ] VerificadorFakeNews (M4)
- [ ] QuizTikTok (M4)
- [ ] InfografiaInteractiva (M4)
- [ ] NavegacionHipertextual (M4)
- [ ] ComicDigital (M5)
- [ ] DiarioMultimedia (M5)
- [ ] VideoCarta (M5)

---

## 4. ORDEN DE EJECUCION

```
FASE A: MIGRACION (Backend)
  └── A.1 Crear y ejecutar migracion de BD
        ↓
FASE B: BACKEND
  ├── B.1 Modificar entidad ModuleProgress
  ├── B.2 Modificar ExerciseSubmissionService
  └── B.3 Actualizar DTOs
        ↓
FASE C: FRONTEND
  ├── C.1 Actualizar tipos de progreso
  ├── C.2 Actualizar FeedbackModal
  ├── C.3 (Opcional) Actualizar CompletionModal
  └── C.4 Verificar ejercicios M3-M5
        ↓
FASE D: VALIDACION
  ├── Pruebas unitarias
  ├── Pruebas de integracion
  └── Pruebas E2E
```

---

## 5. ESTIMACION DE ESFUERZO

| Fase | Tarea | Complejidad | Estimacion |
|------|-------|-------------|------------|
| A.1 | Migracion BD | Media | 1-2 horas |
| B.1 | Entidad ModuleProgress | Baja | 30 min |
| B.2 | ExerciseSubmissionService | Alta | 2-3 horas |
| B.3 | DTOs | Baja | 30 min |
| C.1 | Tipos progreso | Baja | 30 min |
| C.2 | FeedbackModal | Media | 1 hora |
| C.3 | CompletionModal | Media | 1 hora |
| C.4 | Verificar 13 ejercicios | Alta | 2-3 horas |
| D | Validacion | Media | 2-3 horas |
| **TOTAL** | | | **10-14 horas** |

---

## 6. PRUEBAS REQUERIDAS

### 6.1 Pruebas Unitarias

**Backend**:
```typescript
describe('ExerciseSubmissionService', () => {
  describe('updateModuleProgressOnSubmission', () => {
    it('should increment submitted_exercises when exercise is submitted');
    it('should update progress_percentage based on submitted exercises');
    it('should set status to in_progress when first exercise submitted');
    it('should set status to completed when all exercises submitted');
    it('should not affect graded_exercises or XP');
  });
});
```

### 6.2 Pruebas de Integracion

```typescript
describe('Exercise Submission Flow', () => {
  it('should update module progress immediately after submission');
  it('should show correct message in feedback modal');
  it('should not award XP until teacher grades');
  it('should award XP after teacher grades');
});
```

### 6.3 Pruebas E2E

```
Scenario: Estudiante envia ejercicio M3
  Given usuario esta autenticado como estudiante
  And tiene 0% de progreso en Modulo 3
  When envia ejercicio MatrizPerspectivas
  Then progreso del modulo debe ser ~20% (1/5)
  And modal debe mostrar "en espera de validacion"
  And XP debe seguir en 0
  When maestro califica el ejercicio
  Then XP debe incrementarse
  And progreso debe mantenerse igual
```

---

## 7. ROLLBACK PLAN

En caso de problemas:

1. **Revertir migracion**:
   ```bash
   npm run migration:revert
   ```

2. **Revertir codigo backend**: Git revert commits

3. **Revertir codigo frontend**: Git revert commits

4. **Verificar integridad**:
   ```sql
   -- Verificar que progress_percentage sea consistente
   SELECT * FROM progress_tracking.module_progress
   WHERE progress_percentage != graded_progress_percentage;
   ```

---

## 8. DOCUMENTACION A ACTUALIZAR

- [ ] README del proyecto
- [ ] Documentacion de API (Swagger)
- [ ] Documentacion tecnica de progreso
- [ ] Manual de usuario (si aplica)

---

## 9. APROBACIONES REQUERIDAS

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Tech Lead | Pendiente | - | PENDIENTE |
| QA Lead | Pendiente | - | PENDIENTE |
| Product Owner | Pendiente | - | PENDIENTE |

---

**Documento creado por**: Claude (Arquitecto/Lead Developer)
**Fecha de creacion**: 2026-01-08
**Ultima actualizacion**: 2026-01-08
