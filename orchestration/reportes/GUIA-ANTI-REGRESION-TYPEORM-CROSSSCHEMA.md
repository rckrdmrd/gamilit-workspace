# GUIA ANTI-REGRESION: TypeORM Cross-Schema Joins

**Fecha:** 2025-12-18
**Proyecto:** Gamilit
**Tipo:** Guia de Desarrollo Obligatoria
**Prioridad:** CRITICA

---

## RESUMEN

Esta guia documenta el patron CORRECTO para hacer cross-schema joins en TypeORM y advierte sobre el patron INCORRECTO que causa errores en runtime.

---

## REGLA FUNDAMENTAL

```
+------------------------------------------------------------------+
|  EN TYPEORM QUERYBUILDER:                                        |
|                                                                  |
|  .innerJoin('schema.table', ...)    <-- NO FUNCIONA             |
|  .leftJoin('schema.table', ...)     <-- NO FUNCIONA             |
|                                                                  |
|  TypeORM interpreta 'schema' como un ALIAS, no como un schema   |
|  de PostgreSQL. Esto causa:                                     |
|  TypeORMError: "schema" alias was not found                     |
+------------------------------------------------------------------+
```

---

## PATRONES

### PATRON INCORRECTO (NO USAR)

```typescript
// ERROR: TypeORM no entiende 'educational_content' como schema PostgreSQL
const results = await this.exerciseSubmissionRepo
  .createQueryBuilder('es')
  .innerJoin('educational_content.exercises', 'e', 'e.id = es.exercise_id')  // ERROR
  .innerJoin('educational_content.modules', 'm', 'm.id = e.module_id')       // ERROR
  .getRawMany();

// Esto lanza: TypeORMError: "educational_content" alias was not found
```

### PATRON CORRECTO (USAR SIEMPRE)

```typescript
// CORRECTO: Usar raw SQL para cross-schema joins
const sql = `
  SELECT es.*, e.title as exercise_title, m.title as module_title
  FROM progress_tracking.exercise_submissions es
  LEFT JOIN educational_content.exercises e ON e.id = es.exercise_id
  LEFT JOIN educational_content.modules m ON m.id = e.module_id
  WHERE es.user_id = ANY($1)
`;
const results = await this.dataSource.query(sql, [studentIds]);
```

---

## CUANDO APLICA ESTA GUIA

Esta guia aplica cuando necesitas hacer JOIN entre tablas de DIFERENTES SCHEMAS:

| Schema Origen | Schema Destino | Requiere Raw SQL? |
|---------------|----------------|-------------------|
| progress_tracking | educational_content | SI |
| progress_tracking | gamification_system | SI |
| progress_tracking | auth_management | SI |
| social_features | progress_tracking | SI |
| Cualquier otro cross-schema | | SI |

### Cuando NO aplica

Joins dentro del MISMO schema funcionan normalmente con QueryBuilder:

```typescript
// FUNCIONA: Ambas tablas en 'educational_content' schema
const results = await this.exerciseRepo
  .createQueryBuilder('e')
  .innerJoin('e.module', 'm')  // Relacion definida en Entity
  .getRawMany();
```

---

## COMO IMPLEMENTAR RAW SQL CORRECTAMENTE

### Paso 1: Inyectar DataSource

```typescript
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class MiServicio {
  constructor(
    // ... otros repos ...

    @InjectDataSource('progress')  // o el DataSource que necesites
    private readonly dataSource: DataSource,
  ) {}
}
```

### Paso 2: Usar this.dataSource.query()

```typescript
async miFuncion(ids: string[]): Promise<any[]> {
  const sql = `
    SELECT col1, col2, col3
    FROM schema_a.tabla_a a
    LEFT JOIN schema_b.tabla_b b ON b.id = a.b_id
    WHERE a.id = ANY($1)
  `;

  return this.dataSource.query(sql, [ids]);
}
```

### Paso 3: Tipar los resultados

```typescript
interface MiResultado {
  col1: string;
  col2: number;
  col3: Date | null;
}

const results: MiResultado[] = await this.dataSource.query(sql, [ids]);
```

---

## CHECKLIST OBLIGATORIO PARA CODE REVIEWS

Antes de aprobar un PR que modifica servicios con queries TypeORM:

```markdown
## Checklist: Cross-Schema Joins

[ ] Verificar que NO se usa .innerJoin('schema.table', ...) en QueryBuilder
[ ] Verificar que NO se usa .leftJoin('schema.table', ...) en QueryBuilder
[ ] Si hay cross-schema join, verificar que usa raw SQL con dataSource.query()
[ ] Verificar que el DataSource esta inyectado correctamente
[ ] Probar manualmente que el endpoint funciona contra la BD
```

---

## ARCHIVOS CON PATRON CORRECTO (REFERENCIA)

Estos archivos usan raw SQL correctamente para cross-schema joins:

1. `modules/teacher/services/exercise-responses.service.ts:186-210`
2. `modules/teacher/services/teacher-classrooms-crud.service.ts:986-998` (FIX-2025-12-18)

---

## HISTORIA DE ERRORES

| Fecha | Archivo | Error | Solucion |
|-------|---------|-------|----------|
| 2025-12-18 | teacher-classrooms-crud.service.ts | TypeORMError: "educational_content" alias not found | Cambio a raw SQL |

---

## DOCUMENTOS RELACIONADOS

- `orchestration/reportes/ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md`
- `orchestration/reportes/PLAN-CORRECCION-TEACHER-MONITORING-2025-12-18.md` (DEPRECATED - contiene patron incorrecto)

---

## ACCIONES PREVENTIVAS FUTURAS

1. **Agregar test de integracion** que ejecute queries contra BD real
2. **Crear ESLint rule** que detecte `.innerJoin('schema.table')` en QueryBuilder
3. **Documentar en onboarding** de nuevos desarrolladores

---

**IMPORTANTE:** Esta guia debe ser leida por todos los desarrolladores que trabajen con queries cross-schema en el proyecto Gamilit.
