# PLAN DE CORRECCION: Teacher Monitoring Page

> **⚠️ DEPRECATED - NO USAR COMO REFERENCIA ⚠️**
>
> Este documento contiene un **PATRON INCORRECTO** de TypeORM en las lineas 119-143.
> El patron `.innerJoin('schema.table', ...)` NO funciona en TypeORM QueryBuilder.
>
> **DOCUMENTO CORRECTO:** `GUIA-ANTI-REGRESION-TYPEORM-CROSSSCHEMA.md`
> **CORRECCION:** `CORRECCION-FINAL-TYPEORM-CROSSSCHEMA-2025-12-18.md`
>
> Fecha de deprecacion: 2025-12-18

**Fecha:** 2025-12-18
**Referencia:** ANALISIS-TEACHER-MONITORING-2025-12-18.md
**Proyecto:** Gamilit
**Componente:** Teacher Portal - Monitoring Page
**Estado:** DEPRECATED

---

## OBJETIVOS

1. Mostrar TODOS los estudiantes del classroom (no solo 20)
2. Poblar correctamente TODOS los campos del DTO con datos reales
3. Mantener compatibilidad con el frontend existente

---

## ESTRATEGIA DE SOLUCION

Se proponen dos enfoques para el problema de paginacion:

### Opcion A: Eliminar limite por defecto (RECOMENDADA para monitoring)
- Cambiar `limit = 20` a `limit = 100` o mas en el contexto de monitoring
- Razon: El monitoring necesita ver TODOS los estudiantes simultaneamente

### Opcion B: Implementar paginacion completa en frontend
- Agregar controles de paginacion en la UI
- Mas complejo, pero escalable para classrooms muy grandes

**Decision:** Implementar Opcion A inicialmente, con posibilidad de migrar a Opcion B si hay classrooms > 100 estudiantes.

---

## PLAN DE IMPLEMENTACION

### CORRECCION 1: Problema de Paginacion

#### 1.1 Backend - Aumentar limite para endpoint de monitoring

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Linea:** ~253

**Cambio:**
```typescript
// ANTES
const { page = 1, limit = 20, search, status, ... } = query;

// DESPUES
const { page = 1, limit = 100, search, status, ... } = query;
```

**Justificacion:** 100 es un limite razonable para classrooms escolares. Si hay mas, se puede paginar.

#### 1.2 Frontend - Pasar limite explicitamente (opcional pero recomendado)

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`
**Linea:** ~57

**Cambio:**
```typescript
// ANTES
const fetchClassroomStudents = useCallback(async (classroomId: string) => {
  const response = await classroomsApi.getClassroomStudents(classroomId);
  // ...
});

// DESPUES
const fetchClassroomStudents = useCallback(async (classroomId: string) => {
  const response = await classroomsApi.getClassroomStudents(classroomId, { limit: 100 });
  // ...
});
```

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts`
**Linea:** ~67

**Cambio similar** - agregar `limit: 100` al query.

---

### CORRECCION 2: Poblar Campos Faltantes en Backend

#### 2.1 Modificar getStudentsProgress para obtener mas datos

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Funcion:** `getStudentsProgress` (~848)

**Cambio:** Expandir query para obtener mas datos de progreso.

```typescript
private async getStudentsProgress(
  studentIds: string[],
): Promise<Map<string, StudentProgressData>> {
  // Query existente para module_progress
  const progressData = await this.moduleProgressRepo
    .createQueryBuilder('mp')
    .select('mp.user_id', 'user_id')
    .addSelect('AVG(mp.progress_percentage)', 'avg_progress')
    .addSelect('AVG(mp.average_score)', 'avg_score')
    .addSelect('SUM(EXTRACT(EPOCH FROM mp.time_spent) / 60)', 'total_time_minutes')
    .addSelect('MAX(mp.last_accessed_at)', 'last_activity')
    .where('mp.user_id IN (:...studentIds)', { studentIds })
    .groupBy('mp.user_id')
    .getRawMany();

  // ... resto del mapeo
}
```

#### 2.2 Agregar query para current_module y current_exercise

**Nueva funcion** en el servicio:

```typescript
private async getStudentsCurrentActivity(
  studentIds: string[],
): Promise<Map<string, { module: string; exercise: string }>> {
  // Obtener ultima submission por estudiante
  const latestSubmissions = await this.exerciseSubmissionRepo
    .createQueryBuilder('es')
    .select('DISTINCT ON (es.user_id) es.user_id', 'user_id')
    .addSelect('es.exercise_id', 'exercise_id')
    .addSelect('e.title', 'exercise_title')
    .addSelect('m.title', 'module_title')
    .innerJoin('educational_content.exercises', 'e', 'e.id = es.exercise_id')
    .innerJoin('educational_content.modules', 'm', 'm.id = e.module_id')
    .where('es.user_id IN (:...studentIds)', { studentIds })
    .orderBy('es.user_id')
    .addOrderBy('es.submitted_at', 'DESC')
    .getRawMany();

  // Mapear resultados
  const resultMap = new Map();
  latestSubmissions.forEach(row => {
    resultMap.set(row.user_id, {
      module: row.module_title,
      exercise: row.exercise_title,
    });
  });

  return resultMap;
}
```

#### 2.3 Agregar query para gamification data

**Nueva funcion** en el servicio:

```typescript
private async getStudentsGamificationData(
  studentIds: string[],
): Promise<Map<string, GamificationData>> {
  // Obtener stats de gamificacion
  const statsData = await this.userStatsRepo  // Necesita inyectar UserStats repo
    .createQueryBuilder('us')
    .select('us.user_id', 'user_id')
    .addSelect('us.total_ml_coins', 'total_ml_coins')
    .where('us.user_id IN (:...studentIds)', { studentIds })
    .getRawMany();

  // Obtener ranks
  const ranksData = await this.userRanksRepo  // Necesita inyectar UserRanks repo
    .createQueryBuilder('ur')
    .select('ur.user_id', 'user_id')
    .addSelect('mr.display_name', 'rank_name')
    .innerJoin('gamification_system.maya_ranks', 'mr', 'mr.id = ur.current_rank_id')
    .where('ur.user_id IN (:...studentIds)', { studentIds })
    .getRawMany();

  // Obtener conteo de achievements
  const achievementsData = await this.userAchievementsRepo  // Necesita inyectar repo
    .createQueryBuilder('ua')
    .select('ua.user_id', 'user_id')
    .addSelect('COUNT(*)', 'achievements_count')
    .where('ua.user_id IN (:...studentIds)', { studentIds })
    .groupBy('ua.user_id')
    .getRawMany();

  // Combinar y mapear
  const resultMap = new Map();
  // ... logica de combinacion
  return resultMap;
}
```

#### 2.4 Agregar query para exercises completed/total

**Nueva funcion** en el servicio:

```typescript
private async getStudentsExerciseStats(
  studentIds: string[],
): Promise<Map<string, { completed: number; total: number }>> {
  // Ejercicios completados por estudiante
  const completedData = await this.exerciseSubmissionRepo
    .createQueryBuilder('es')
    .select('es.user_id', 'user_id')
    .addSelect('COUNT(DISTINCT es.exercise_id)', 'completed')
    .where('es.user_id IN (:...studentIds)', { studentIds })
    .andWhere('es.is_correct = :isCorrect', { isCorrect: true })
    .groupBy('es.user_id')
    .getRawMany();

  // Total de ejercicios disponibles
  const totalExercises = await this.exerciseRepo
    .createQueryBuilder('e')
    .where('e.is_active = :isActive', { isActive: true })
    .getCount();

  // Mapear
  const resultMap = new Map();
  completedData.forEach(row => {
    resultMap.set(row.user_id, {
      completed: parseInt(row.completed),
      total: totalExercises,
    });
  });

  return resultMap;
}
```

#### 2.5 Modificar getClassroomStudents para usar las nuevas funciones

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Funcion:** `getClassroomStudents` (~245)

```typescript
async getClassroomStudents(...) {
  // ... codigo existente para obtener members ...

  const studentIds = members.map((m) => m.student_id);

  if (studentIds.length === 0) { /* ... */ }

  // Obtener datos en paralelo
  const [profiles, users, progressData, currentActivity, gamificationData, exerciseStats] = await Promise.all([
    this.profileRepo.find({ where: { user_id: In(studentIds) } }),
    this.userRepo.find({ where: { id: In(studentIds) } }),
    this.getStudentsProgress(studentIds),
    this.getStudentsCurrentActivity(studentIds),
    this.getStudentsGamificationData(studentIds),
    this.getStudentsExerciseStats(studentIds),
  ]);

  // Mapear con todos los datos
  let data = members.map((member) => {
    const profile = profiles.find((p) => p.user_id === member.student_id);
    const user = users.find((u) => u.id === member.student_id);
    const progress = progressData.get(member.student_id);
    const activity = currentActivity.get(member.student_id);
    const gamification = gamificationData.get(member.student_id);
    const exercises = exerciseStats.get(member.student_id);

    return this.mapToStudentInClassroomDto(member, profile, user, progress, activity, gamification, exercises);
  });

  // ... resto del codigo ...
}
```

#### 2.6 Modificar mapToStudentInClassroomDto

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Funcion:** `mapToStudentInClassroomDto` (~963)

```typescript
private mapToStudentInClassroomDto(
  member: ClassroomMember,
  profile?: Profile,
  user?: User,
  progress?: { progress: number; score: number; timeMinutes: number; lastActivity: Date },
  activity?: { module: string; exercise: string },
  gamification?: { mlCoins: number; rank: string; achievements: number },
  exercises?: { completed: number; total: number },
): StudentInClassroomDto {
  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'Unknown Student';

  return {
    user_id: member.student_id,
    full_name: fullName || 'Unknown Student',
    email: user?.email,
    avatar: profile?.avatar_url || undefined,
    enrollment_date: member.enrollment_date,
    status: member.status,
    progress_percentage: progress?.progress ?? 0,
    score_average: progress?.score ?? 0,
    last_activity: progress?.lastActivity ?? member.updated_at,
    attendance_percentage: member.attendance_percentage || undefined,
    teacher_notes: member.teacher_notes || undefined,
    // Nuevos campos
    current_module: activity?.module ?? null,
    current_exercise: activity?.exercise ?? null,
    time_spent_minutes: progress?.timeMinutes ?? 0,
    exercises_completed: exercises?.completed ?? 0,
    exercises_total: exercises?.total ?? 0,
    total_ml_coins: gamification?.mlCoins ?? 0,
    current_rank: gamification?.rank ?? null,
    achievements_count: gamification?.achievements ?? 0,
  };
}
```

---

### CORRECCION 3: Ajustar Frontend para compatibilidad

#### 3.1 Ajustar mapeo de respuesta API

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`

```typescript
const fetchClassroomStudents = useCallback(async (classroomId: string) => {
  const response = await classroomsApi.getClassroomStudents(classroomId, { limit: 100 });
  // Mapear user_id a id si es necesario
  const mappedStudents = response.data.map(student => ({
    ...student,
    id: student.user_id,  // Compatibilidad con tipo StudentMonitoring
  }));
  setStudents(mappedStudents);
}, []);
```

#### 3.2 Asegurar valores por defecto en tipos

**Archivo:** `apps/frontend/src/apps/teacher/types/index.ts`

No requiere cambios si el backend envia todos los campos. Los valores opcionales se manejan con `??` en el componente.

---

## ORDEN DE IMPLEMENTACION

| Paso | Componente | Archivo | Prioridad | Dependencia |
|------|------------|---------|-----------|-------------|
| 1 | Backend | teacher-classrooms-crud.service.ts (limit) | P0 | Ninguna |
| 2 | Backend | teacher-classrooms-crud.service.ts (getStudentsProgress mejorado) | P0 | Paso 1 |
| 3 | Backend | teacher-classrooms-crud.service.ts (nuevas funciones query) | P1 | Paso 2 |
| 4 | Backend | teacher-classrooms-crud.service.ts (mapToStudentInClassroomDto) | P1 | Paso 3 |
| 5 | Frontend | useClassrooms.ts (limit param) | P1 | Paso 1 |
| 6 | Frontend | useStudentMonitoring.ts (limit param) | P1 | Paso 1 |

---

## REPOSITORIOS ADICIONALES A INYECTAR

El servicio `TeacherClassroomsCrudService` necesita acceso a repositorios adicionales:

```typescript
// Ya existentes
@InjectRepository(ModuleProgress, 'progress')
@InjectRepository(ExerciseSubmission, 'progress')

// Nuevos requeridos
@InjectRepository(UserStats, 'gamification')
@InjectRepository(UserRank, 'gamification')
@InjectRepository(UserAchievement, 'gamification')
```

**Nota:** Verificar que las entidades estan exportadas en los modulos correspondientes.

---

## VALIDACIONES POST-IMPLEMENTACION

1. [ ] Verificar que se muestran 44+ estudiantes
2. [ ] Verificar que `progress_percentage` tiene valores correctos
3. [ ] Verificar que `score_average` tiene valores correctos
4. [ ] Verificar que `current_module` muestra el modulo actual
5. [ ] Verificar que `current_exercise` muestra el ejercicio actual
6. [ ] Verificar que `time_spent_minutes` tiene valor correcto
7. [ ] Verificar que `exercises_completed` / `exercises_total` son correctos
8. [ ] Verificar que `total_ml_coins` corresponde a gamification_system.user_stats
9. [ ] Verificar que `current_rank` corresponde a maya_ranks
10. [ ] Verificar que `achievements_count` es correcto
11. [ ] Verificar que `last_activity` usa la fecha real de actividad

---

## RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Performance con muchos JOINs | Medio | Usar Promise.all para queries paralelos |
| Entidades no exportadas | Alto | Verificar modulos antes de implementar |
| Cache de frontend | Bajo | Forzar refresh despues de cambios |

---

## ESTIMACION

- **P0 (Paginacion basica):** 30 minutos
- **P1 (Datos completos):** 2-3 horas

---

**Siguiente Fase:** Validacion del Plan vs Analisis
