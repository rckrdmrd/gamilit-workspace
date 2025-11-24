# SQL QUERIES ÚTILES PARA BACKEND-DEVELOPER

**Fecha:** 2025-11-23
**Propósito:** Consultas SQL para acceder a la estructura de `categoryExpectations` desde el backend

---

## 🔍 CONSULTAS DE ESTRUCTURA

### 1. Obtener el Ejercicio Completo

```sql
SELECT
  id,
  exercise_type,
  title,
  content,
  solution,
  max_points,
  passing_score
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

**Uso:** Cargar ejercicio completo al iniciar sesión del estudiante

---

### 2. Obtener Solo los Fragmentos de Texto

```sql
SELECT
  jsonb_array_elements(content->'fragments') as fragmento
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

**Resultado:**
```json
{
  "id": "frag-1",
  "text": "Marie Curie fue pionera...",
  "difficulty": "medium"
}
```

---

### 3. Obtener categoryExpectations para un Fragmento Específico

```sql
SELECT
  solution->'fragments'->0->'categoryExpectations' as expectations_frag_1
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

**Uso:** Obtener todas las categorías disponibles para validación

---

### 4. Obtener Keywords de una Categoría Específica

```sql
-- Fragmento 1, Categoría Literal
SELECT
  solution->'fragments'->0->'categoryExpectations'->'cat-literal'->'keywords' as keywords
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

**Resultado:**
```json
[
  "pionera",
  "radiactividad",
  "nobel",
  "primera",
  "mujer",
  "cientifico",
  "premio",
  "campos",
  "unica"
]
```

---

### 5. Obtener Puntos de una Categoría

```sql
SELECT
  (solution->'fragments'->0->'categoryExpectations'->'cat-critico'->>'points')::int as puntos_critico
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

**Resultado:** `30`

---

## 🛠️ CONSULTAS PARA VALIDACIÓN EN RUNTIME

### 6. Validar Keywords en Respuesta del Usuario

```sql
-- Query parametrizada para TypeORM
-- Fragmento: :fragmentIndex (0, 1, 2)
-- Categoría: :categoryId ("cat-literal", "cat-inferencial", etc.)

SELECT
  solution->'fragments'->:fragmentIndex->'categoryExpectations'->:categoryId as category_data
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

**Ejemplo TypeORM (Repository):**
```typescript
async getCategoryExpectations(
  fragmentIndex: number,
  categoryId: string
): Promise<CategoryExpectation> {
  const result = await this.exerciseRepository
    .createQueryBuilder('exercise')
    .select(`solution->'fragments'->${fragmentIndex}->'categoryExpectations'->>'${categoryId}'`, 'data')
    .where('exercise.exercise_type = :type', { type: 'rueda_inferencias' })
    .getRawOne();

  return JSON.parse(result.data);
}
```

---

### 7. Obtener Todos los Fragmentos con sus Expectativas

```sql
SELECT
  idx + 1 as fragmento_numero,
  solution->'fragments'->idx->>'id' as fragmento_id,
  solution->'fragments'->idx->>'text' as texto,
  solution->'fragments'->idx->'categoryExpectations' as expectativas
FROM educational_content.exercises,
  generate_series(0, 2) as idx
WHERE exercise_type = 'rueda_inferencias';
```

**Resultado:**
| fragmento_numero | fragmento_id | texto | expectativas |
|------------------|--------------|-------|--------------|
| 1 | frag-1 | Marie Curie fue pionera... | {...} |
| 2 | frag-2 | A pesar de enfrentar... | {...} |
| 3 | frag-3 | Los cuadernos de Marie... | {...} |

---

## 📦 ESTRUCTURA TYPESCRIPT PARA BACKEND

### Interface para CategoryExpectation

```typescript
interface CategoryExpectation {
  keywords: string[];
  description: string;
  example: string;
  points: number;
}

interface FragmentSolution {
  id: string;
  text: string;
  categoryExpectations: {
    'cat-literal': CategoryExpectation;
    'cat-inferencial': CategoryExpectation;
    'cat-critico': CategoryExpectation;
    'cat-creativo': CategoryExpectation;
  };
}

interface ExerciseSolution {
  validation: {
    minKeywords: number;
    minLength: number;
    maxLength: number;
  };
  fragments: FragmentSolution[];
}
```

---

### Ejemplo de Uso en Service

```typescript
async validateRuedaInferencias(
  exerciseId: string,
  userAnswers: RuedaInferenciasAnswersDto,
  fragmentStates: FragmentState[]
): Promise<ValidationResult> {
  // 1. Obtener ejercicio con solution
  const exercise = await this.exerciseRepository.findOne({
    where: { id: exerciseId },
  });

  const solution: ExerciseSolution = exercise.solution as ExerciseSolution;
  const fragments = solution.fragments;

  let totalScore = 0;
  let maxScore = 0;
  const feedbackByFragment = [];

  // 2. Validar cada fragmento según su categoría
  for (const fragment of fragments) {
    // Obtener respuesta del usuario para este fragmento
    const userAnswer = userAnswers.fragments[fragment.id];

    // Obtener categoría usada
    const fragmentState = fragmentStates.find(fs => fs.fragmentId === fragment.id);
    const categoryId = fragmentState?.categoryId || 'cat-literal';

    // Obtener expectativas para esta categoría
    const categoryExpectation = fragment.categoryExpectations[categoryId];

    if (!categoryExpectation) {
      continue; // Fallback si no hay expectativas
    }

    maxScore += categoryExpectation.points;

    // 3. Validar keywords
    const expectedKeywords = categoryExpectation.keywords;
    const userAnswerLower = userAnswer.toLowerCase();

    const foundKeywords = expectedKeywords.filter(keyword =>
      userAnswerLower.includes(keyword.toLowerCase())
    );

    // 4. Calcular score
    const minKeywords = solution.validation.minKeywords;
    let fragmentScore = 0;

    if (foundKeywords.length >= minKeywords) {
      const keywordRatio = Math.min(
        foundKeywords.length / expectedKeywords.length,
        1
      );
      fragmentScore = Math.round(categoryExpectation.points * keywordRatio);
    }

    totalScore += fragmentScore;

    // 5. Generar feedback
    let feedback = '';
    if (fragmentScore >= categoryExpectation.points * 0.8) {
      feedback = `¡Excelente! Tu inferencia ${categoryExpectation.description.toLowerCase()}.`;
    } else if (fragmentScore >= categoryExpectation.points * 0.5) {
      feedback = `Bien, pero podrías mejorar. ${categoryExpectation.description}. Ejemplo: "${categoryExpectation.example}"`;
    } else {
      feedback = `Intenta nuevamente. ${categoryExpectation.description}. Ejemplo: "${categoryExpectation.example}"`;
    }

    feedbackByFragment.push({
      fragmentId: fragment.id,
      categoryUsed: categoryId,
      keywordsFound: foundKeywords,
      keywordsExpected: expectedKeywords,
      score: fragmentScore,
      maxScore: categoryExpectation.points,
      feedback,
    });
  }

  // 6. Retornar resultado
  return {
    score: totalScore,
    maxScore,
    feedback: {
      overall:
        totalScore >= maxScore * 0.75
          ? '¡Excelente trabajo! Demostraste comprensión de diferentes tipos de inferencias.'
          : 'Buen intento. Revisa los ejemplos para mejorar tus inferencias.',
      byFragment: feedbackByFragment,
    },
  };
}
```

---

## 🧪 QUERIES DE TESTING

### 8. Simular Validación de Keywords

```sql
-- Simular detección de keywords en respuesta del usuario
WITH user_answer AS (
  SELECT 'Marie fue la primera mujer en ganar un Nobel en dos campos científicos' as respuesta
),
expected AS (
  SELECT jsonb_array_elements_text(
    solution->'fragments'->0->'categoryExpectations'->'cat-literal'->'keywords'
  ) as keyword
  FROM educational_content.exercises
  WHERE exercise_type = 'rueda_inferencias'
)
SELECT
  keyword,
  CASE
    WHEN (SELECT LOWER(respuesta) FROM user_answer) LIKE '%' || LOWER(keyword) || '%'
    THEN '✓ Encontrada'
    ELSE '✗ No encontrada'
  END as estado
FROM expected
ORDER BY estado DESC, keyword;
```

**Resultado:**
```
keyword       | estado
--------------+---------------
nobel         | ✓ Encontrada
primera       | ✓ Encontrada
mujer         | ✓ Encontrada
campos        | ✓ Encontrada
cientifico    | ✓ Encontrada
radiactividad | ✗ No encontrada
pionera       | ✗ No encontrada
premio        | ✗ No encontrada
unica         | ✗ No encontrada
```

---

### 9. Calcular Score Simulado

```sql
-- Calcular score basado en ratio de keywords encontradas
WITH user_answer AS (
  SELECT 'Marie demostró determinación y resiliencia al superar obstáculos con fortaleza y motivación' as respuesta
),
expected AS (
  SELECT
    solution->'fragments'->1->'categoryExpectations'->'cat-inferencial'->'keywords' as keywords,
    (solution->'fragments'->1->'categoryExpectations'->'cat-inferencial'->>'points')::int as max_points
  FROM educational_content.exercises
  WHERE exercise_type = 'rueda_inferencias'
),
keyword_analysis AS (
  SELECT
    jsonb_array_elements_text(keywords) as keyword,
    max_points
  FROM expected
),
found_keywords AS (
  SELECT
    keyword,
    max_points,
    CASE
      WHEN (SELECT LOWER(respuesta) FROM user_answer) LIKE '%' || LOWER(keyword) || '%'
      THEN 1
      ELSE 0
    END as found
  FROM keyword_analysis
)
SELECT
  SUM(found) as keywords_encontradas,
  COUNT(*) as keywords_totales,
  MAX(max_points) as puntos_maximos,
  ROUND(
    (SUM(found)::numeric / COUNT(*)::numeric) * MAX(max_points)::numeric
  )::int as puntos_obtenidos
FROM found_keywords;
```

**Resultado:**
```
keywords_encontradas | keywords_totales | puntos_maximos | puntos_obtenidos
--------------------+------------------+----------------+------------------
                 4 |                8 |             25 |               13
```

---

## 📋 QUERIES DE DEBUGGING

### 10. Ver Estructura Completa Pretty-Printed

```sql
SELECT jsonb_pretty(
  solution->'fragments'->0->'categoryExpectations'->'cat-critico'
) as critico_fragment_1
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';
```

---

### 11. Listar Todas las Keywords del Ejercicio

```sql
SELECT
  'Frag-' || (idx + 1)::text as fragmento,
  cat_key as categoria,
  jsonb_array_elements_text(
    solution->'fragments'->idx->'categoryExpectations'->cat_key->'keywords'
  ) as keyword
FROM educational_content.exercises,
  generate_series(0, 2) as idx,
  unnest(ARRAY['cat-literal', 'cat-inferencial', 'cat-critico', 'cat-creativo']) as cat_key
WHERE exercise_type = 'rueda_inferencias'
ORDER BY fragmento, categoria, keyword;
```

---

## 🎯 EJEMPLOS DE INTEGRACIÓN

### Uso en NestJS Repository

```typescript
@Injectable()
export class RuedaInferenciasRepository {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  async getFragmentExpectations(
    fragmentIndex: number,
    categoryId: string,
  ): Promise<CategoryExpectation> {
    const query = `
      SELECT
        solution->'fragments'->$1->'categoryExpectations'->$2 as data
      FROM educational_content.exercises
      WHERE exercise_type = 'rueda_inferencias'
    `;

    const result = await this.exerciseRepository.query(query, [
      fragmentIndex,
      categoryId,
    ]);

    return result[0]?.data || null;
  }

  async getAllFragments(): Promise<FragmentSolution[]> {
    const exercise = await this.exerciseRepository.findOne({
      where: { exercise_type: 'rueda_inferencias' },
    });

    const solution = exercise.solution as ExerciseSolution;
    return solution.fragments;
  }
}
```

---

**Preparado por:** Database-Agent
**Fecha:** 2025-11-23
**Para:** Backend-Developer
**Propósito:** Facilitar integración de validación de Rueda de Inferencias
