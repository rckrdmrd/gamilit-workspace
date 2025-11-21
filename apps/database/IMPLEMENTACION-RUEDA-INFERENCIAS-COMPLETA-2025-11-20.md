# Implementación Completa: Rueda de Inferencias con Texto Libre

**Fecha:** 2025-11-20
**Tareas:** DB-071 + DB-071-WRAPPER
**Estado:** ✅ COMPLETADO 100%
**Prioridad:** P1 (Alta) - Desbloquea BE-FE-071

---

## 📋 Resumen Ejecutivo

### Objetivo
Rediseñar el ejercicio "Rueda de Inferencias" (Módulo 2, Ejercicio 5) desde formato matching pairs a texto libre con validación automática basada en keywords.

### Alcance
- ✅ Content del ejercicio actualizado (4 categorías, 6 fragmentos)
- ✅ Solution con keywords y criterios de validación
- ✅ 3 funciones SQL de validación (auxiliar + directa + wrapper)
- ✅ Configuración de validación actualizada
- ✅ 14 tests ejecutados (100% exitosos)
- ✅ Documentación completa

---

## 🎯 Problema Original vs Solución

### Antes (Matching Pairs)
```
Formato: Drag & drop
- Usuario conecta inferencias predefinidas con conclusiones predefinidas
- Limitado a opciones cerradas
- No permite escritura creativa
- Validación: comparación exacta de pares

Ejemplo:
Inferencia 1 → "Marie fue pionera" [opción A]
Inferencia 2 → "Recibió dos Nobel" [opción B]
```

**Limitaciones:**
- No evalúa capacidad de escritura del estudiante
- Respuestas muy guiadas
- Poco desafío inferencial

### Después (Texto Libre)
```
Formato: Escritura libre
- Usuario lee 6 fragmentos de texto sobre Marie Curie
- Escribe su propia inferencia para cada fragmento (20-200 caracteres)
- Selecciona tipo de inferencia: Literal, Inferencial, Crítico, Creativo
- Validación automática basada en keywords

Ejemplo:
Fragmento: "Marie Curie fue la primera mujer en ganar un Premio Nobel..."
Usuario escribe: "Marie fue pionera en física y química, siendo la primera mujer en recibir el Nobel en ciencias exactas."

Validación:
✅ Longitud: 78 caracteres (válido: 20-200)
✅ Keywords encontrados: 5 (nobel, física, química, primera, mujer)
✅ Mínimo requerido: 2 keywords
→ Resultado: VÁLIDO, 20 puntos
```

**Beneficios:**
- Desarrolla habilidad de escritura inferencial
- Evaluación automática objetiva
- Feedback inmediato y específico
- Mayor desafío cognitivo

---

## 🏗️ Arquitectura de Validación

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: RuedaInferenciasExercise.tsx (FE-071)       │
│  Envía: { fragments: { "frag-1": "texto...", ... } }   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: exercise-submission.service.ts (BE-071)       │
│  Llama: validate_answer(solution, submitted_answer)    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Database: validate_answer.sql                          │
│  Llama: validate_rueda_inferencias(...)                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  validate_rueda_inferencias() - WRAPPER ESTÁNDAR        │
│  • Recibe p_solution y p_submitted_answer               │
│  • Itera sobre cada fragmento                           │
│  • Para cada fragmento:                                 │
│    └─> Llama _validate_single_fragment()               │
│  • Acumula puntos y genera resultado consolidado        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  _validate_single_fragment() - AUXILIAR INTERNA         │
│  • Recibe keywords, criterios, texto del usuario        │
│  • Valida longitud (20-200 chars)                       │
│  • Normaliza texto (lowercase + sin acentos)            │
│  • Cuenta keywords encontrados                          │
│  • Retorna: {is_valid, points, feedback, ...}           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  validate_rueda_inferencias_text() - VALIDADOR DIRECTO  │
│  • USO ALTERNATIVO: Validación desde endpoint directo   │
│  • Recibe exercise_id, fragment_id, user_text           │
│  • Busca ejercicio en BD                                │
│  • Extrae solution del fragmento                        │
│  • Delega a _validate_single_fragment()                │
└─────────────────────────────────────────────────────────┘
```

### Funciones SQL

#### 1. `_validate_single_fragment()` - Auxiliar Interna

**Propósito:** Lógica core de validación, reutilizable por ambos validadores

**Firma:**
```sql
_validate_single_fragment(
    p_keywords JSONB,           -- ["nobel", "física", "química", ...]
    p_min_keywords INTEGER,     -- 2
    p_min_length INTEGER,       -- 20
    p_max_length INTEGER,       -- 200
    p_user_text TEXT,           -- Texto escrito por el usuario
    p_points INTEGER            -- 20
) RETURNS JSONB
```

**Validaciones:**
1. Longitud de texto (min: 20, max: 200)
2. Normalización (lowercase + sin acentos via `gamilit.normalize_text()`)
3. Búsqueda de keywords en texto
4. Conteo de keywords encontrados
5. Validación de mínimo (>= 2 keywords requeridos)

**Retorno:**
```json
{
  "is_valid": true,
  "matched_keywords": ["nobel", "física", "química", "primera", "mujer"],
  "keyword_count": 5,
  "min_keywords_required": 2,
  "points": 20,
  "max_points": 20,
  "text_length": 78,
  "min_length": 20,
  "max_length": 200,
  "feedback": "¡Excelente! Has incluido 5 conceptos clave del fragmento."
}
```

#### 2. `validate_rueda_inferencias_text()` - Validador Directo

**Propósito:** Validar un fragmento específico (uso desde endpoints directos del backend)

**Firma:**
```sql
validate_rueda_inferencias_text(
    p_exercise_id UUID,         -- ID del ejercicio
    p_fragment_id TEXT,         -- "frag-1", "frag-2", etc.
    p_user_text TEXT            -- Texto del usuario
) RETURNS JSONB
```

**Proceso:**
1. Busca ejercicio en `educational_content.exercises`
2. Extrae `solution->'validation'` para criterios globales
3. Busca fragmento específico en `solution->'fragments'`
4. Extrae keywords y puntos del fragmento
5. Delega validación a `_validate_single_fragment()`

**Uso típico:**
```sql
SELECT validate_rueda_inferencias_text(
    '7bd580d3-b9ab-47f0-8bed-fe68e6598948'::uuid,
    'frag-1',
    'Marie Curie fue la primera mujer en ganar el Nobel en física.'
);
```

#### 3. `validate_rueda_inferencias()` - Wrapper Estándar

**Propósito:** Integración con el sistema estándar de validación (validate_answer)

**Firma:**
```sql
validate_rueda_inferencias(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,                   -- 100
    p_allow_partial_credit BOOLEAN,         -- true
    p_normalize_text BOOLEAN,               -- true
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
) RETURNS RECORD
```

**Formato esperado:**

**p_solution:**
```json
{
  "fragments": [
    {
      "id": "frag-1",
      "keywords": ["nobel", "física", "química", "primera", "mujer", "ciencias"],
      "points": 20
    },
    { "id": "frag-2", ... },
    ...
  ],
  "validation": {
    "minKeywords": 2,
    "minLength": 20,
    "maxLength": 200
  }
}
```

**p_submitted_answer:**
```json
{
  "fragments": {
    "frag-1": "Marie Curie fue la primera mujer en ganar el Nobel...",
    "frag-2": "Ella usaba el apellido Curie en sus publicaciones...",
    "frag-3": "A pesar de la discriminación de género..."
  }
}
```

**Proceso:**
1. Extrae criterios globales de validación
2. Itera sobre `p_submitted_answer.fragments`
3. Para cada fragmento:
   - Busca solution del fragmento
   - Extrae keywords y puntos
   - Llama a `_validate_single_fragment()`
   - Acumula puntos si es válido
4. Calcula score final ajustado a p_max_points (100)
5. Genera feedback consolidado
6. Retorna resultado con detalles por fragmento

**Retorno:**
```sql
is_correct: false
score: 67
feedback: "2 de 3 inferencias válidas. Revisa los fragmentos marcados..."
details: {
  "total_fragments": 3,
  "valid_fragments": 2,
  "total_points_possible": 60,
  "points_earned": 40,
  "percentage": 67,
  "results_per_fragment": [...]
}
```

---

## 📊 Content y Solution del Ejercicio

### Exercise ID
```
7bd580d3-b9ab-47f0-8bed-fe68e6598948
```

### Content (JSONB)

```json
{
  "categories": [
    {
      "id": "literal",
      "name": "Literal",
      "icon": "📖",
      "description": "Información explícita en el texto"
    },
    {
      "id": "inferencial",
      "name": "Inferencial",
      "icon": "🔍",
      "description": "Conclusiones basadas en pistas del texto"
    },
    {
      "id": "critico",
      "name": "Crítico",
      "icon": "💭",
      "description": "Evaluación y opinión fundamentada"
    },
    {
      "id": "creativo",
      "name": "Creativo",
      "icon": "✨",
      "description": "Nuevas ideas inspiradas en el texto"
    }
  ],
  "fragments": [
    {
      "id": "frag-1",
      "text": "Marie Curie fue la primera mujer en ganar un Premio Nobel y la única persona en ganarlo en dos ciencias diferentes: Física (1903) y Química (1911)."
    },
    {
      "id": "frag-2",
      "text": "Marie usaba su apellido de casada 'Curie' en todas sus publicaciones científicas, aunque en Polonia era conocida por su apellido de soltera 'Skłodowska'."
    },
    {
      "id": "frag-3",
      "text": "A pesar de sus logros, Marie enfrentó discriminación de género. La Academia de Ciencias de Francia rechazó su candidatura en 1911, el mismo año que ganó su segundo Nobel."
    },
    {
      "id": "frag-4",
      "text": "Marie continuó investigando incluso después de la muerte de su esposo Pierre. Su dedicación al radio la llevó a desarrollar unidades móviles de rayos X durante la Primera Guerra Mundial."
    },
    {
      "id": "frag-5",
      "text": "Los cuadernos de laboratorio de Marie Curie aún son radiactivos más de 100 años después. Deben almacenarse en cajas de plomo y solo pueden consultarse con equipo de protección."
    },
    {
      "id": "frag-6",
      "text": "Marie creía firmemente que la ciencia pertenecía a toda la humanidad. Se negó a patentar el proceso de aislamiento del radio, permitiendo que otros científicos pudieran replicar su trabajo libremente."
    }
  ]
}
```

### Solution (JSONB)

```json
{
  "fragments": [
    {
      "id": "frag-1",
      "keywords": ["nobel", "física", "química", "primera", "mujer", "ciencias"],
      "points": 20
    },
    {
      "id": "frag-2",
      "keywords": ["apellido", "curie", "sklodowska", "polonia", "publicaciones"],
      "points": 20
    },
    {
      "id": "frag-3",
      "keywords": ["discriminación", "género", "academia", "francia", "rechazo"],
      "points": 20
    },
    {
      "id": "frag-4",
      "keywords": ["pierre", "esposo", "radio", "rayos", "guerra"],
      "points": 20
    },
    {
      "id": "frag-5",
      "keywords": ["radiactivos", "cuadernos", "plomo", "protección", "laboratorio"],
      "points": 20
    },
    {
      "id": "frag-6",
      "keywords": ["patente", "humanidad", "aislamiento", "científicos", "libremente"],
      "points": 20
    }
  ],
  "validation": {
    "minKeywords": 2,
    "minLength": 20,
    "maxLength": 200
  }
}
```

**Puntuación:**
- 20 puntos por fragmento × 6 fragmentos = **120 puntos máximos**
- Ajustado a 100 por el wrapper estándar
- Puntuación mínima de aprobación: 70/100 (≈ 4 fragmentos válidos)

---

## 🧪 Testing Completo

### Tests de Función Auxiliar (via validate_rueda_inferencias_text)

**6 tests ejecutados:**

| # | Caso | Resultado | Detalle |
|---|------|-----------|---------|
| 1 | ✅ Respuesta válida con 5 keywords | VÁLIDO | 20 puntos, feedback positivo |
| 2 | ✅ Respuesta válida con 2 keywords (mínimo) | VÁLIDO | 20 puntos |
| 3 | ❌ Respuesta con 0 keywords | INVÁLIDO | 0 puntos, feedback de mejora |
| 4 | ❌ Texto muy corto (<20 chars) | INVÁLIDO | Error específico de longitud |
| 5 | ❌ Texto muy largo (>200 chars) | INVÁLIDO | Error específico de longitud |
| 6 | ✅ Normalización (mayúsculas/acentos) | FUNCIONA | Keywords encontrados correctamente |

### Tests de Wrapper Estándar

**8 tests ejecutados:**

| # | Caso | Fragmentos | Score | Feedback |
|---|------|------------|-------|----------|
| 1 | ✅ Todos válidos | 3/3 | 100 | "¡Excelente! Todas las 3 inferencias..." |
| 2 | ⚠️ Parcial | 2/3 | 67 | "2 de 3 inferencias válidas..." |
| 3 | ❌ Ninguno válido | 0/3 | 0 | "Ninguna inferencia válida..." |
| 4 | ⚠️ Con texto corto | 2/3 | 67 | Feedback por fragmento |
| 5 | ✅ Solo 1 fragmento | 1/1 | 100 | Funciona con cantidad variable |
| 6 | ⚠️ Crédito parcial | 2/3 | 67 | Cálculo correcto |
| 7 | ✅ Función directa refactorizada | - | - | Compatibilidad mantenida |
| 8 | ✅ Llamada con exercise_id | - | - | Ambas funciones coexisten |

**Resultado total:** 14/14 tests ✅ (100% exitosos)

---

## 📁 Archivos Modificados

### DDL (Funciones)

**Creado:**
- `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql`
  - Contiene 3 funciones:
    1. `_validate_single_fragment()` (auxiliar interna)
    2. `validate_rueda_inferencias_text()` (refactorizada)
    3. `validate_rueda_inferencias()` (wrapper estándar)

**Deprecado:**
- `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias_text.sql` → DEPRECATED
- `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias-DEPRECATED.sql` (versión matching pairs)

### Seeds

**Actualizado:**
- `seeds/prod/educational_content/10-exercise_validation_config.sql`
  - Cambio: `validation_function` de `validate_rueda_inferencias_text` → `validate_rueda_inferencias`
  - Ejemplo actualizado con múltiples fragmentos

### Ejercicio

**Actualizado en BD:**
- Exercise ID: `7bd580d3-b9ab-47f0-8bed-fe68e6598948`
- `content`: 4 categorías + 6 fragmentos
- `solution`: Keywords por fragmento + criterios de validación

### Documentación

**Creado:**
- `apps/database/IMPLEMENTACION-RUEDA-INFERENCIAS-COMPLETA-2025-11-20.md` (este documento)

**Actualizado:**
- `orchestration/TRAZA-TAREAS-FRONTEND.md`:
  - Entrada DB-071 (rediseño inicial)
  - Entrada DB-071-WRAPPER (función wrapper)

---

## 🚀 Integración Backend (BE-071)

### Endpoint de Submission

```typescript
// apps/backend/src/modules/educational/services/exercise-submission.service.ts

async submitAnswer(userId: string, exerciseId: string, answer: any) {
  const exercise = await this.exercisesService.findOne(exerciseId);

  // Para rueda_inferencias, answer tiene formato:
  const submittedAnswer = {
    fragments: {
      "frag-1": "Marie Curie fue pionera en...",
      "frag-2": "Ella usaba el apellido...",
      // ... hasta 6 fragmentos
    }
  };

  // validate_answer() automáticamente llama a validate_rueda_inferencias()
  const validationResult = await this.validateAnswer(
    exercise.solution,
    submittedAnswer,
    exercise.max_points
  );

  // validationResult contiene:
  // {
  //   is_correct: boolean,
  //   score: number,          // 0-100
  //   feedback: string,
  //   details: {
  //     total_fragments: 6,
  //     valid_fragments: 4,
  //     results_per_fragment: [...]
  //   }
  // }

  return this.createSubmission(userId, exerciseId, validationResult);
}
```

### Respuesta al Frontend

```json
{
  "submission_id": "...",
  "is_correct": false,
  "score": 67,
  "xp_earned": 67,
  "ml_coins_earned": 67,
  "feedback": "4 de 6 inferencias válidas. Revisa los fragmentos marcados para mejorar tu respuesta.",
  "details": {
    "total_fragments": 6,
    "valid_fragments": 4,
    "total_points_possible": 120,
    "points_earned": 80,
    "percentage": 67,
    "results_per_fragment": [
      {
        "fragment_id": "frag-1",
        "is_valid": true,
        "matched_keywords": ["nobel", "física", "química", "primera", "mujer"],
        "keyword_count": 5,
        "points": 20,
        "feedback": "¡Excelente! Has incluido 5 conceptos clave del fragmento."
      },
      {
        "fragment_id": "frag-2",
        "is_valid": false,
        "matched_keywords": ["curie"],
        "keyword_count": 1,
        "points": 0,
        "feedback": "Tu inferencia necesita más relación con el texto. Has incluido 1 conceptos clave, pero necesitas al menos 2."
      },
      // ... más fragmentos
    ]
  }
}
```

---

## 🎨 Integración Frontend (FE-071)

### Componente a Implementar

**Ubicación:** `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`

### UI Propuesto

```
┌────────────────────────────────────────────────────────┐
│  Rueda de Inferencias: Marie Curie                    │
│                                                        │
│  [Instrucciones]                                       │
│  Lee cada fragmento y escribe tu propia inferencia.   │
│  Selecciona el tipo de inferencia que realizaste.     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Categorías de Inferencias:                       │ │
│  │                                                  │ │
│  │  📖 Literal      🔍 Inferencial                 │ │
│  │  💭 Crítico      ✨ Creativo                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  Fragmento 1 de 6:                                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ "Marie Curie fue la primera mujer en ganar un   │ │
│  │  Premio Nobel y la única persona en ganarlo en  │ │
│  │  dos ciencias diferentes: Física (1903) y       │ │
│  │  Química (1911)."                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Selecciona tipo de inferencia:                       │
│  ( ) 📖 Literal  (•) 🔍 Inferencial                  │
│  ( ) 💭 Crítico  ( ) ✨ Creativo                     │
│                                                        │
│  Escribe tu inferencia (20-200 caracteres):           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Marie Curie fue pionera en ciencias exactas,    │ │
│  │ siendo la primera mujer en recibir el premio    │ │
│  │ Nobel en física y química.                       │ │
│  └──────────────────────────────────────────────────┘ │
│  78/200 caracteres                                     │
│                                                        │
│  [Siguiente Fragmento →]                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Estado del Componente

```typescript
interface FragmentResponse {
  fragmentId: string;
  categoryId: string;
  text: string;
}

const [responses, setResponses] = useState<Record<string, FragmentResponse>>({});
const [currentFragment, setCurrentFragment] = useState(0);

// Al enviar
const answer = {
  fragments: Object.fromEntries(
    Object.entries(responses).map(([id, resp]) => [id, resp.text])
  )
};

await submitAnswer(exerciseId, answer);
```

### Feedback Visual

```
┌────────────────────────────────────────────────────────┐
│  Resultados: 4 de 6 inferencias válidas               │
│                                                        │
│  Score: 67/100  |  XP: +67  |  ML Coins: +67         │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ✅ Fragmento 1: VÁLIDO                          │ │
│  │    "Marie Curie fue pionera en..."              │ │
│  │    Keywords: nobel, física, química, primera    │ │
│  │    +20 puntos                                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ❌ Fragmento 2: INVÁLIDO                        │ │
│  │    "Ella trabajó mucho."                         │ │
│  │    Necesitas incluir al menos 2 conceptos clave │ │
│  │    0 puntos                                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Ver Detalles] [Reintentar]                          │
└────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Completitud

### Database (DB-071 + DB-071-WRAPPER)
- [x] Content del ejercicio actualizado (4 categorías, 6 fragmentos)
- [x] Solution con keywords y criterios
- [x] Función auxiliar `_validate_single_fragment()` creada
- [x] Función directa `validate_rueda_inferencias_text()` refactorizada
- [x] Wrapper estándar `validate_rueda_inferencias()` creado
- [x] exercise_validation_config actualizado
- [x] 14 tests ejecutados (100% exitosos)
- [x] Documentación completa

### Backend (BE-071) - PENDIENTE
- [ ] Adaptar endpoint de submission para formato `{fragments: {...}}`
- [ ] Integrar con `validate_rueda_inferencias()` via validate_answer
- [ ] Procesar resultado y retornar feedback detallado
- [ ] Testing de integración

### Frontend (FE-071) - PENDIENTE
- [ ] Crear componente RuedaInferenciasExercise
- [ ] UI con 4 categorías visuales
- [ ] 6 fragmentos con textarea para respuestas
- [ ] Validación de longitud (20-200 chars)
- [ ] Indicador de caracteres
- [ ] Feedback visual por fragmento
- [ ] Integración con flujo de submissions

---

## 📚 Referencias

### Especificación Original
- `orchestration/database/DB-071-RUEDA-INFERENCIAS-REDISENO.md`

### Funciones SQL
- `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql`

### Configuración
- `seeds/prod/educational_content/10-exercise_validation_config.sql`

### Documentación
- `orchestration/TRAZA-TAREAS-FRONTEND.md` (entradas DB-071 y DB-071-WRAPPER)
- `apps/database/IMPLEMENTACION-RUEDA-INFERENCIAS-COMPLETA-2025-11-20.md` (este documento)

---

**Última actualización:** 2025-11-20
**Ejecutado por:** Database Agent
**Estado:** ✅ DATABASE 100% COMPLETADO - LISTO PARA BE-FE-071
