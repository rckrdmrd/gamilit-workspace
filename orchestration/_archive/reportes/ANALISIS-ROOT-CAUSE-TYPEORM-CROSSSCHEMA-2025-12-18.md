# ANALISIS ROOT CAUSE: Error TypeORM Cross-Schema Joins

**Fecha:** 2025-12-18
**Analista:** Requirements-Analyst
**Proyecto:** Gamilit
**Error:** `TypeORMError: "educational_content" alias was not found. Maybe you forgot to join it?`
**Endpoint:** `GET /api/v1/teacher/classrooms/:id/students`

---

## RESUMEN EJECUTIVO

El error 500 en el Teacher Dashboard al cargar estudiantes se debe a un **patron incorrecto de TypeORM QueryBuilder** para cross-schema joins introducido en la implementacion del 2025-12-18.

**Causa Raiz:** La funcion `getStudentsCurrentActivity()` usa `.innerJoin('educational_content.exercises', ...)` que es sintaxis SQL valida pero **NO funciona** en TypeORM QueryBuilder.

---

## SECCION 1: ANALISIS DEL ERROR

### 1.1 Stack Trace
```
TypeORMError: "educational_content" alias was not found. Maybe you forgot to join it?
  at teacher/services/teacher-classrooms-crud.service.ts
```

### 1.2 Flujo del Error
```
1. Usuario: admin_teacher hace login
2. Frontend: Navega a /teacher/dashboard
3. Frontend: TeacherDashboard.tsx:102 llama fetchAllStudents()
4. Frontend: classroomsApi.ts:205 llama GET /api/v1/teacher/classrooms/:id/students
5. Backend: teacher-classrooms-crud.service.ts:249 ejecuta getClassroomStudents()
6. Backend: Linea 317 llama getStudentsCurrentActivity()
7. Backend: Linea 980-981 ejecuta query con innerJoin incorrecto
8. ERROR: TypeORM no reconoce 'educational_content' como alias registrado
```

### 1.3 Codigo Problematico
**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Lineas:** 976-987

```typescript
const latestSubmissions = await this.exerciseSubmissionRepo
  .createQueryBuilder('es')
  .select('DISTINCT ON (es.user_id) es.user_id', 'user_id')
  .addSelect('es.exercise_id', 'exercise_id')
  .innerJoin('educational_content.exercises', 'e', 'e.id = es.exercise_id')  // <-- ERROR
  .innerJoin('educational_content.modules', 'm', 'm.id = e.module_id')       // <-- ERROR
  .addSelect('e.title', 'exercise_title')
  .addSelect('m.title', 'module_title')
  .where('es.user_id IN (:...studentIds)', { studentIds })
  .orderBy('es.user_id')
  .addOrderBy('es.submitted_at', 'DESC')
  .getRawMany();
```

---

## SECCION 2: CAUSA RAIZ TECNICA

### 2.1 Por que falla el patron `.innerJoin('schema.table', ...)`

TypeORM QueryBuilder **NO soporta** la sintaxis `schema.table` directamente en metodos de join. El QueryBuilder espera:
- Un nombre de entidad registrada (`Exercise`)
- O un alias previamente declarado en la query

Cuando escribes `.innerJoin('educational_content.exercises', 'e', ...)`:
- TypeORM busca un alias llamado `educational_content` en la query actual
- Como no existe, lanza el error: `"educational_content" alias was not found`

### 2.2 Por que la sintaxis parece correcta (pero no lo es)

El patron `educational_content.exercises` es **SQL valido** pero TypeORM NO lo interpreta como SQL, sino como:
- `educational_content` = alias de una tabla ya declarada
- `.exercises` = relacion de esa tabla

### 2.3 Por que en otros archivos funciona

En `exercise-responses.service.ts`, la misma sintaxis **SI funciona** porque se usa **raw SQL**:

```typescript
// FUNCIONA - Raw SQL
const sql = `
  SELECT ...
  FROM progress_tracking.exercise_attempts attempt
  LEFT JOIN educational_content.exercises exercise ON exercise.id = attempt.exercise_id
  LEFT JOIN educational_content.modules module ON module.id = exercise.module_id
`;
const results = await this.dataSource.query(sql, params);
```

---

## SECCION 3: HISTORIA DEL ERROR (RECURRENCIA)

### 3.1 Introduccion del Error

| Fecha | Documento | Accion |
|-------|-----------|--------|
| 2025-12-18 | PLAN-CORRECCION-TEACHER-MONITORING-2025-12-18.md | Se propone codigo con patron incorrecto (lineas 119-130) |
| 2025-12-18 | IMPLEMENTACION-TEACHER-MONITORING-2025-12-18.md | Se implementa siguiendo el plan |

### 3.2 Por que el error es recurrente

1. **El patron PARECE correcto** - La sintaxis es SQL valida, por lo que desarrolladores la copian
2. **TypeScript NO detecta el error** - Compila sin problemas, falla en runtime
3. **No hay tests de integracion** - El error solo aparece cuando se ejecuta contra la BD
4. **El plan documentado tiene el error** - Futuros implementadores copiaran el patron incorrecto
5. **No hay guia de TypeORM cross-schema** - No existe documentacion de como hacerlo correctamente

---

## SECCION 4: PATRON CORRECTO

### 4.1 Opcion A: Raw SQL Query (RECOMENDADO)

```typescript
private async getStudentsCurrentActivity(
  studentIds: string[],
): Promise<Map<string, { current_module: string | null; current_exercise: string | null }>> {
  if (studentIds.length === 0) {
    return new Map();
  }

  // Usar raw SQL para cross-schema joins
  const sql = `
    SELECT DISTINCT ON (es.user_id)
      es.user_id,
      e.title as exercise_title,
      m.title as module_title
    FROM progress_tracking.exercise_submissions es
    LEFT JOIN educational_content.exercises e ON e.id = es.exercise_id
    LEFT JOIN educational_content.modules m ON m.id = e.module_id
    WHERE es.user_id = ANY($1)
    ORDER BY es.user_id, es.submitted_at DESC
  `;

  const results = await this.dataSource.query(sql, [studentIds]);

  const resultMap = new Map<string, { current_module: string | null; current_exercise: string | null }>();

  // Inicializar todos con null
  studentIds.forEach(id => {
    resultMap.set(id, { current_module: null, current_exercise: null });
  });

  // Actualizar con resultados
  results.forEach((row: any) => {
    resultMap.set(row.user_id, {
      current_module: row.module_title || null,
      current_exercise: row.exercise_title || null,
    });
  });

  return resultMap;
}
```

### 4.2 Opcion B: Queries Separadas (Mas simple pero mas queries)

```typescript
private async getStudentsCurrentActivity(
  studentIds: string[],
): Promise<Map<string, { current_module: string | null; current_exercise: string | null }>> {
  if (studentIds.length === 0) {
    return new Map();
  }

  // Query 1: Obtener ultimas submissions por estudiante
  const submissions = await this.exerciseSubmissionRepo
    .createQueryBuilder('es')
    .select(['es.user_id', 'es.exercise_id'])
    .where('es.user_id IN (:...studentIds)', { studentIds })
    .orderBy('es.submitted_at', 'DESC')
    .getMany();

  // Obtener exercise_ids unicos
  const exerciseIds = [...new Set(submissions.map(s => s.exercise_id))];

  if (exerciseIds.length === 0) {
    return new Map(studentIds.map(id => [id, { current_module: null, current_exercise: null }]));
  }

  // Query 2: Obtener ejercicios con sus modulos (mismo schema - funciona con QueryBuilder)
  const exercises = await this.exerciseRepo
    .createQueryBuilder('e')
    .select(['e.id', 'e.title', 'e.module_id'])
    .where('e.id IN (:...exerciseIds)', { exerciseIds })
    .getMany();

  // Query 3: Obtener modulos
  const moduleIds = [...new Set(exercises.map(e => e.module_id))];
  const modules = await this.moduleRepo
    .createQueryBuilder('m')
    .select(['m.id', 'm.title'])
    .where('m.id IN (:...moduleIds)', { moduleIds })
    .getMany();

  // Mapear resultados
  const exerciseMap = new Map(exercises.map(e => [e.id, e]));
  const moduleMap = new Map(modules.map(m => [m.id, m]));

  const resultMap = new Map<string, { current_module: string | null; current_exercise: string | null }>();

  // Encontrar primera submission por estudiante
  const firstSubmissionByStudent = new Map<string, typeof submissions[0]>();
  for (const sub of submissions) {
    if (!firstSubmissionByStudent.has(sub.user_id)) {
      firstSubmissionByStudent.set(sub.user_id, sub);
    }
  }

  studentIds.forEach(studentId => {
    const submission = firstSubmissionByStudent.get(studentId);
    if (submission) {
      const exercise = exerciseMap.get(submission.exercise_id);
      const module = exercise ? moduleMap.get(exercise.module_id) : null;
      resultMap.set(studentId, {
        current_module: module?.title || null,
        current_exercise: exercise?.title || null,
      });
    } else {
      resultMap.set(studentId, { current_module: null, current_exercise: null });
    }
  });

  return resultMap;
}
```

---

## SECCION 5: IMPACTO Y DEPENDENCIAS

### 5.1 Archivos Impactados

| Archivo | Tipo | Cambio Requerido |
|---------|------|------------------|
| `teacher-classrooms-crud.service.ts` | Backend | Corregir `getStudentsCurrentActivity()` |

### 5.2 Dependencias

```yaml
Dependencias_del_Servicio:
  - ExerciseSubmission (progress schema)
  - Exercise (educational schema)
  - Module (educational schema)

Dependencias_a_agregar:
  - DataSource (para raw SQL)
```

### 5.3 Otros usos del patron incorrecto (verificado)

Archivos con potencial problema (usando `.innerJoin('schema.table')` en QueryBuilder):
- Solo en `teacher-classrooms-crud.service.ts:980-981`

Archivos que usan raw SQL correctamente:
- `exercise-responses.service.ts:186-189, 209, 346-347`

---

## SECCION 6: PREVENCION DE RECURRENCIA

### 6.1 Acciones Inmediatas

1. **Corregir el codigo** - Usar raw SQL o queries separadas
2. **Actualizar documentacion del plan** - Marcar PLAN-CORRECCION-TEACHER-MONITORING-2025-12-18.md como DEPRECATED
3. **Crear guia de patrones** - Documentar patrones correctos/incorrectos

### 6.2 Acciones a Mediano Plazo

1. **Crear ADR** - Architecture Decision Record para cross-schema joins
2. **Agregar tests de integracion** - Que ejecuten queries contra BD real
3. **Linter rule** - Detectar uso de `.innerJoin('schema.table')` en QueryBuilder

### 6.3 Checklist para Futuras Implementaciones

```markdown
## Checklist: Cross-Schema Joins en TypeORM

[ ] NO usar `.innerJoin('schema.table', ...)` en QueryBuilder
[ ] SI necesitas cross-schema join, usar una de estas opciones:
    [ ] Raw SQL con `this.dataSource.query(sql, params)`
    [ ] Queries separadas por schema
    [ ] Vistas de base de datos (si es muy frecuente)
[ ] Probar manualmente contra BD antes de marcar como completo
```

---

## SECCION 7: PLAN DE CORRECCION

### Paso 1: Agregar DataSource al servicio (si no existe)

```typescript
// En el constructor
constructor(
  // ... repos existentes ...
  @InjectDataSource()
  private readonly dataSource: DataSource,
) {}
```

### Paso 2: Reemplazar funcion problematica

Usar Opcion A (Raw SQL) de Seccion 4.1

### Paso 3: Verificar compilacion

```bash
cd apps/backend && npx tsc --noEmit
```

### Paso 4: Probar endpoint manualmente

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/api/v1/teacher/classrooms/00000000-0000-0000-0000-000000000001/students
```

---

## CONCLUSIONES

1. **El error es TECNICO** - TypeORM QueryBuilder no soporta `schema.table` syntax
2. **El error es RECURRENTE** - El plan original documenta un patron incorrecto
3. **La solucion es USAR RAW SQL** - Para cross-schema joins
4. **La prevencion requiere DOCUMENTACION** - Crear guia de patrones correctos

---

**Estado:** ANALISIS COMPLETO - Listo para implementacion
**Siguiente Fase:** Validacion del plan e implementacion
