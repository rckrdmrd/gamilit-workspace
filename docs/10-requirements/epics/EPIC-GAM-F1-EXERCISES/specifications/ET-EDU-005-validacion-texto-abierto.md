---
titulo: "ET-EDU-005: Validación de Texto Abierto (Rueda de Inferencias)"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-EDU-005: Validación de Texto Abierto (Rueda de Inferencias)

**Fecha:** 2025-11-21
**Versión:** 1.0
**Módulo:** 2.5 - Rueda de Inferencias
**Tipo:** Especificación Técnica

---

## 1. Resumen Ejecutivo

Este documento especifica cómo el sistema valida las respuestas de texto abierto (inferencias) en el ejercicio "Rueda de Inferencias". A diferencia de ejercicios con respuestas cerradas (opción múltiple, verdadero/falso), este mecanismo permite al estudiante escribir texto libre que se valida mediante **coincidencia de palabras clave (keywords)**.

---

## 2. Formato de Respuesta Esperada

### 2.1 Estructura del Frontend al Backend

```typescript
// Formato que envía el frontend
interface SubmitAnswerPayload {
  userId: string;        // UUID del usuario
  exerciseId: string;    // UUID del ejercicio
  answers: {
    fragments: Record<string, string>;  // { "frag-1": "texto...", "frag-2": "texto..." }
    categoryId?: string;                // Categoría seleccionada (opcional)
    timeSpent?: number;                 // Tiempo en segundos (opcional)
  }
}
```

### 2.2 Ejemplo de Respuesta Válida

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "exerciseId": "ex-rueda-001",
  "answers": {
    "fragments": {
      "frag-1": "Marie Curie fue una pionera en el estudio de la radiactividad y ganó dos premios Nobel.",
      "frag-2": "Su determinación la llevó a superar los obstáculos de su época y convertirse en la primera mujer catedrática.",
      "frag-3": "Los cuadernos de Marie Curie siguen siendo radiactivos después de más de cien años."
    },
    "categoryId": "cat-inferencial",
    "timeSpent": 142
  }
}
```

---

## 3. Proceso de Validación

### 3.1 Flujo General

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. RECEPCIÓN                                                           │
│     Backend recibe: { fragments: { "frag-1": "texto...", ... } }       │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. OBTENCIÓN DE SOLUCIÓN                                               │
│     Base de datos retorna keywords para cada fragmento                  │
│     Ejemplo: ["pionera", "radiactividad", "nobel", "primera", "mujer"] │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. NORMALIZACIÓN DE TEXTO                                              │
│     - Convertir a minúsculas                                            │
│     - Eliminar acentos (á→a, é→e, í→i, ó→o, ú→u, ñ→n)                 │
│     - Eliminar espacios extra                                           │
│     Ejemplo: "Marie Curie fue PIONERA" → "marie curie fue pionera"     │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. VALIDACIÓN DE LONGITUD                                              │
│     - Mínimo: 20 caracteres                                             │
│     - Máximo: 200 caracteres                                            │
│     Si no cumple → Respuesta inválida con feedback específico          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. CONTEO DE KEYWORDS                                                  │
│     - Buscar cada keyword en el texto normalizado                       │
│     - Contar coincidencias (LIKE '%keyword%')                           │
│     - Mínimo requerido: 2 keywords                                      │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. CÁLCULO DE PUNTUACIÓN                                               │
│     - Cada fragmento válido: 20 puntos                                  │
│     - Score final: (puntos_obtenidos / puntos_totales) * 100           │
│     - Ejemplo: 3/5 fragmentos válidos = 60 puntos                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Criterios de Validación por Fragmento

| Criterio | Valor Default | Configurable |
|----------|--------------|--------------|
| Longitud mínima | 20 caracteres | ✅ Sí |
| Longitud máxima | 200 caracteres | ✅ Sí |
| Keywords mínimos | 2 | ✅ Sí |
| Puntos por fragmento | 20 | ✅ Sí |

---

## 4. Estructura de la Solución en Base de Datos

### 4.1 Formato JSON de la Solución

```json
{
  "validation": {
    "minKeywords": 2,
    "minLength": 20,
    "maxLength": 200
  },
  "fragments": [
    {
      "id": "frag-1",
      "keywords": ["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio", "campos", "unica"],
      "points": 20
    },
    {
      "id": "frag-2",
      "keywords": ["determinacion", "obstaculos", "epoca", "primera", "mujer", "catedratica", "universidad", "superacion"],
      "points": 20
    },
    {
      "id": "frag-3",
      "keywords": ["cuadernos", "radiactivos", "legado", "cien", "anos", "investigacion", "historia", "impacto"],
      "points": 20
    }
  ]
}
```

### 4.2 Descripción de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `validation.minKeywords` | integer | Número mínimo de keywords que debe contener el texto |
| `validation.minLength` | integer | Longitud mínima del texto en caracteres |
| `validation.maxLength` | integer | Longitud máxima del texto en caracteres |
| `fragments[].id` | string | Identificador único del fragmento (debe coincidir con el enviado) |
| `fragments[].keywords` | string[] | Lista de palabras clave que se buscarán en el texto |
| `fragments[].points` | integer | Puntos otorgados si el fragmento es válido |

---

## 5. Ejemplos de Validación

### 5.1 Respuesta VÁLIDA

**Texto del usuario:**
> "Marie Curie fue una pionera en la radiactividad y recibió el premio Nobel dos veces"

**Análisis:**
- Longitud: 89 caracteres ✅ (entre 20-200)
- Keywords encontrados: "pionera", "radiactividad", "premio", "nobel" = 4 keywords ✅ (≥ 2)
- **Resultado:** VÁLIDO - 20 puntos

### 5.2 Respuesta INVÁLIDA (muy corta)

**Texto del usuario:**
> "Marie Curie ganó"

**Análisis:**
- Longitud: 16 caracteres ❌ (menor que 20)
- **Resultado:** INVÁLIDO - 0 puntos
- **Feedback:** "El texto es demasiado corto. Mínimo 20 caracteres, tienes 16."

### 5.3 Respuesta INVÁLIDA (sin keywords suficientes)

**Texto del usuario:**
> "Ella era una persona muy inteligente y trabajadora que logró muchas cosas importantes."

**Análisis:**
- Longitud: 87 caracteres ✅ (entre 20-200)
- Keywords encontrados: 0 ❌ (ninguna keyword coincide)
- **Resultado:** INVÁLIDO - 0 puntos
- **Feedback:** "Tu inferencia necesita más relación con el texto. Has incluido 0 conceptos clave, pero necesitas al menos 2."

### 5.4 Respuesta PARCIALMENTE VÁLIDA (1 keyword)

**Texto del usuario:**
> "Marie Curie fue una mujer muy importante en la historia de la ciencia moderna."

**Análisis:**
- Longitud: 78 caracteres ✅
- Keywords encontrados: "mujer" = 1 keyword ❌ (necesita 2)
- **Resultado:** INVÁLIDO - 0 puntos
- **Feedback:** "Tu inferencia necesita más relación con el texto. Has incluido 1 conceptos clave, pero necesitas al menos 2."

---

## 6. Respuesta del Backend al Frontend

### 6.1 Estructura de Respuesta Exitosa

```json
{
  "attemptId": "att-123-456",
  "score": 67,
  "isPerfect": false,
  "correctAnswersCount": 2,
  "totalQuestions": 3,
  "feedback": {
    "overall": "2 de 3 inferencias válidas. Revisa los fragmentos marcados para mejorar tu respuesta."
  },
  "details": {
    "total_fragments": 3,
    "valid_fragments": 2,
    "total_points_possible": 60,
    "points_earned": 40,
    "percentage": 67,
    "validation_criteria": {
      "min_keywords": 2,
      "min_length": 20,
      "max_length": 200
    },
    "results_per_fragment": [
      {
        "fragment_id": "frag-1",
        "is_valid": true,
        "matched_keywords": ["pionera", "radiactividad", "nobel", "premio"],
        "keyword_count": 4,
        "points": 20,
        "feedback": "¡Excelente! Has incluido 4 conceptos clave del fragmento."
      },
      {
        "fragment_id": "frag-2",
        "is_valid": true,
        "matched_keywords": ["determinacion", "obstaculos"],
        "keyword_count": 2,
        "points": 20,
        "feedback": "¡Excelente! Has incluido 2 conceptos clave del fragmento."
      },
      {
        "fragment_id": "frag-3",
        "is_valid": false,
        "matched_keywords": ["cuadernos"],
        "keyword_count": 1,
        "points": 0,
        "feedback": "Tu inferencia necesita más relación con el texto. Has incluido 1 conceptos clave, pero necesitas al menos 2."
      }
    ]
  },
  "rewards": {
    "xpEarned": 67,
    "mlCoinsEarned": 15
  }
}
```

---

## 7. Función SQL de Validación

### 7.1 Ubicación
```
apps/database/ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql
```

### 7.2 Funciones Disponibles

| Función | Propósito |
|---------|-----------|
| `_validate_single_fragment()` | Función auxiliar que valida un fragmento individual |
| `validate_rueda_inferencias_text()` | Valida un fragmento específico dado exercise_id y fragment_id |
| `validate_rueda_inferencias()` | Wrapper estándar que valida todos los fragmentos |

### 7.3 Normalización de Texto

La función `gamilit.normalize_text()` realiza:
1. Conversión a minúsculas (`LOWER()`)
2. Eliminación de acentos: á→a, é→e, í→i, ó→o, ú→u, ñ→n
3. Trim de espacios

```sql
-- Ejemplo interno
v_normalized_user_text := LOWER(gamilit.normalize_text(TRIM(p_user_text)));
```

---

## 8. Configuración del Ejercicio en Seeds

### 8.1 Ejemplo de Seed Completo

```sql
INSERT INTO educational_content.exercises (
    id,
    mission_id,
    type,
    difficulty_level,
    title,
    description,
    instructions,
    config,
    content,
    solution,
    rubric,
    time_limit_seconds,
    xp_reward,
    ml_coins_reward,
    order_index,
    is_active
) VALUES (
    'ex-rueda-001'::uuid,
    'mission-002'::uuid,
    'rueda_inferencias'::educational_content.exercise_type,
    'intermediate'::educational_content.difficulty_level,
    'Rueda de Inferencias: Marie Curie',
    'Gira la ruleta y escribe inferencias sobre los fragmentos de texto.',
    'Lee cada fragmento y escribe una inferencia que demuestre comprensión profunda.',
    -- CONFIG: Configuración visual y de comportamiento
    '{
        "wheelAnimation": true,
        "showTimer": true,
        "timerSeconds": 30,
        "allowSkip": false,
        "minCharacters": 20,
        "maxCharacters": 200
    }'::jsonb,
    -- CONTENT: Lo que ve el estudiante
    '{
        "categories": [
            { "id": "cat-literal", "name": "Literal", "color": "#4ECDC4", "icon": "📖" },
            { "id": "cat-inferencial", "name": "Inferencial", "color": "#FF6B6B", "icon": "🔍" },
            { "id": "cat-critico", "name": "Crítico", "color": "#95E1D3", "icon": "💡" },
            { "id": "cat-creativo", "name": "Creativo", "color": "#F38181", "icon": "🎨" }
        ],
        "fragments": [
            { "id": "frag-1", "text": "Marie Curie fue la primera mujer en ganar un Premio Nobel..." },
            { "id": "frag-2", "text": "A pesar de los obstáculos de su época..." },
            { "id": "frag-3", "text": "Sus cuadernos de laboratorio siguen siendo radiactivos..." }
        ],
        "settings": {
            "timerSeconds": 30,
            "minLength": 20,
            "maxLength": 200
        }
    }'::jsonb,
    -- SOLUTION: Keywords para validación
    '{
        "validation": {
            "minKeywords": 2,
            "minLength": 20,
            "maxLength": 200
        },
        "fragments": [
            {
                "id": "frag-1",
                "keywords": ["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio"],
                "points": 20
            },
            {
                "id": "frag-2",
                "keywords": ["determinacion", "obstaculos", "epoca", "primera", "catedratica", "superacion"],
                "points": 20
            },
            {
                "id": "frag-3",
                "keywords": ["cuadernos", "radiactivos", "legado", "cien", "anos", "historia", "impacto"],
                "points": 20
            }
        ]
    }'::jsonb,
    -- RUBRIC
    '{
        "criteria": [
            { "name": "Relevancia", "weight": 0.5, "description": "Uso de conceptos clave del texto" },
            { "name": "Longitud", "weight": 0.3, "description": "Cumplimiento de extensión requerida" },
            { "name": "Coherencia", "weight": 0.2, "description": "Texto comprensible y bien estructurado" }
        ]
    }'::jsonb,
    180,  -- time_limit_seconds (3 minutos total)
    50,   -- xp_reward
    20,   -- ml_coins_reward
    5,    -- order_index
    true  -- is_active
);
```

---

## 9. Guía para Crear Keywords Efectivos

### 9.1 Principios

1. **Conceptos clave del texto**: Incluir sustantivos y verbos importantes
2. **Sin acentos**: Las keywords deben estar normalizadas (sin acentos)
3. **Variedad**: Incluir sinónimos para dar flexibilidad
4. **Específicos al tema**: Evitar palabras muy genéricas

### 9.2 Ejemplo de Buenos Keywords

Para un fragmento sobre Marie Curie:
- ✅ "pionera", "radiactividad", "nobel", "polonio", "radio", "descubrimiento"
- ❌ "importante", "famosa", "científica" (muy genéricos)

### 9.3 Cantidad Recomendada

- **Mínimo**: 5 keywords por fragmento
- **Recomendado**: 7-10 keywords por fragmento
- **Máximo**: 15 keywords por fragmento

---

## 10. Trazabilidad

| Documento | Relación |
|-----------|----------|
| DB-071 | Función SQL de validación |
| BE-FE-071 | DTO de backend |
| FE-071 | Componente de frontend |
| US-ACT-005 | Historia de usuario |

---

## 11. Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-21 | Versión inicial |

---

**Autor:** Frontend Agent (NEXUS-FRONTEND)
**Revisado por:** -
**Estado:** ✅ APROBADO
