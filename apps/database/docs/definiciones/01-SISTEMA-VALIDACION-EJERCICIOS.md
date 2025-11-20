# Sistema de Validación de Ejercicios - Definiciones

**Documento:** Definiciones y Conceptos
**Versión:** 1.0
**Fecha:** 2025-11-19
**Autor:** Database Agent

---

## 📖 Glosario de Términos

### Ejercicio (`exercise`)
Unidad de contenido educativo que el estudiante debe completar. Puede ser auto-calificable o requiere revisión manual del profesor.

### Validación
Proceso de verificar si una respuesta de ejercicio es correcta y asignar puntuación.

### Validador
Función PostgreSQL específica que valida un tipo particular de ejercicio (ej. `validate_crucigrama`).

### Auto-gradable (`auto_gradable`)
Ejercicio que puede ser calificado automáticamente por el sistema sin intervención del profesor.

### Auditoría (`audit`)
Registro inmutable de una validación, incluyendo snapshot de la respuesta, ejercicio y configuración.

### Snapshot
Copia inmutable del estado de un objeto en un momento específico.

### Recálculo
Proceso de re-validar una respuesta usando el snapshot original para verificar si hubo un error en la validación inicial.

### Discrepancia
Diferencia entre el resultado de una validación original y un recálculo.

### Validación Heurística
Validación basada en criterios básicos (longitud, keywords) que NO valida la calidad del contenido.

### Validación Técnica
Validación de aspectos técnicos (formato, duración, tamaño) sin evaluar contenido.

### Partial Credit
Sistema de calificación proporcional donde se otorgan puntos parciales por respuestas parcialmente correctas.

### Fuzzy Matching
Comparación de texto que acepta similitud (no exactitud) usando algoritmos como trigram similarity.

---

## 📋 Tipos de Ejercicios

### Módulo 1: Comprensión Literal

#### 1. Crucigrama (`crucigrama`)
**Definición:** Puzzle de palabras cruzadas donde el estudiante completa palabras basadas en pistas.

**Características:**
- Validación: Matching exacto con normalización
- Partial credit: Sí (por palabra correcta)
- Case sensitive: No (configurable)
- Fuzzy matching: No

**Formato de respuesta:**
```jsonb
{
  "clues": {
    "h1": "SORBONA",
    "h2": "NOBEL"
  }
}
```

#### 2. Línea de Tiempo (`linea_tiempo`)
**Definición:** Ordenamiento secuencial de eventos históricos o narrativos.

**Características:**
- Validación: Orden secuencial correcto
- Partial credit: Sí
- Algoritmo: Comparación de secuencia

**Formato de respuesta:**
```jsonb
{
  "events": ["event_3", "event_1", "event_4", "event_2"]
}
```

#### 3. Sopa de Letras (`sopa_letras`)
**Definición:** Búsqueda de palabras ocultas en una matriz de letras.

**Características:**
- Validación: Lista de palabras encontradas
- Partial credit: Sí (por palabra)
- Normalización: Sí

**Formato de respuesta:**
```jsonb
{
  "words": ["RADIO", "NOBEL", "FISICA"]
}
```

#### 4. Completar Espacios (`completar_espacios`)
**Definición:** Rellenar espacios en blanco dentro de un texto.

**Características:**
- Validación: Matching exacto o fuzzy
- Fuzzy matching: Opcional (threshold 0.70-0.80)
- Partial credit: Sí (por espacio)
- Normalización: Sí

**Formato de respuesta:**
```jsonb
{
  "blanks": {
    "blank1": "científica",
    "blank2": "Nobel"
  }
}
```

#### 5. Verdadero/Falso (`verdadero_falso`)
**Definición:** Declaraciones que el estudiante debe marcar como verdaderas o falsas.

**Características:**
- Validación: Boolean matching
- Partial credit: Sí (por declaración)

**Formato de respuesta:**
```jsonb
{
  "statements": {
    "stmt1": true,
    "stmt2": false
  }
}
```

---

### Módulo 2: Comprensión Inferencial

#### 6. Detective Textual (`detective_textual`)
**Definición:** Multiple choice basado en inferencias extraídas del texto.

**Características:**
- Validación: Matching de opciones
- Partial credit: Sí
- Tipo: Inferencial (requiere comprensión profunda)

**Formato de respuesta:**
```jsonb
{
  "questions": {
    "q1": "option_b",
    "q2": "option_a"
  }
}
```

#### 7. Construcción de Hipótesis (`construccion_hipotesis`)
**Definición:** Respuesta abierta donde el estudiante construye una hipótesis.

**Características:**
- Validación: **HEURÍSTICA**
- Criterios: Longitud mínima (20 palabras) + keywords
- Partial credit: Sí
- **IMPORTANTE:** NO valida calidad del contenido

**Criterios de validación:**
- 50% por longitud mínima
- 50% por presencia de keywords (tesis, evidencia, porque)
- Umbral mínimo: 70% del puntaje

**Formato de respuesta:**
```jsonb
{
  "hypothesis": "Marie Curie descubrió el radio porque realizó experimentos rigurosos con minerales radiactivos..."
}
```

**⚠️ Requiere revisión manual del profesor**

#### 8. Predicción Narrativa (`prediccion_narrativa`)
**Definición:** Predicción sobre el desarrollo de una narrativa.

**Características:**
- Validación: **HEURÍSTICA**
- Criterios: Longitud mínima (30 palabras) + keywords narrativos
- Similar a construcción de hipótesis pero con umbral más alto

**Formato de respuesta:**
```jsonb
{
  "prediction": "El personaje principal decidirá confrontar al antagonista porque..."
}
```

**⚠️ Requiere revisión manual del profesor**

#### 9. Puzzle de Contexto (`puzzle_contexto`)
**Definición:** Multiple choice con enfoque en inferencias contextuales.

**Características:**
- Validación: Matching de opciones
- Partial credit: Sí
- Similar a detective_textual

**Formato de respuesta:**
```jsonb
{
  "questions": {
    "q1": "option_a",
    "q2": "option_d"
  }
}
```

#### 10. Rueda de Inferencias (`rueda_inferencias`)
**Definición:** Matching de pares inferencia-conclusión.

**Características:**
- Validación: Matching de pares
- Partial credit: Sí
- Normalización: Sí

**Formato de respuesta:**
```jsonb
{
  "inferences": {
    "inf1": "conclusion1",
    "inf2": "conclusion2"
  }
}
```

---

### Módulo 3: Pensamiento Crítico

#### 11. Tribunal de Opiniones (`tribunal_opiniones`)
**Definición:** Opinión argumentada sobre un tema.

**Características:**
- Validación: **HEURÍSTICA**
- Longitud mínima: 100 palabras
- Keywords: argumentativos (tesis, argumento, evidencia)
- Bonus: estructura argumentativa (5-10 puntos)

**Criterios de validación:**
- 45% longitud mínima
- 45% keywords encontrados
- 10% bonus estructura

**Formato de respuesta:**
```jsonb
{
  "opinion": "En mi opinión, la inteligencia artificial debe ser regulada porque..."
}
```

**⚠️ Requiere revisión manual del profesor**

#### 12. Debate Digital (`debate_digital`)
**Definición:** Argumento y contraargumento sobre un tema.

**Características:**
- Validación: **HEURÍSTICA**
- Longitud mínima: 150 palabras totales
- Requiere ambas partes: argument + counterargument
- Keywords: debate (sin embargo, por el contrario, no obstante)

**Criterios de validación:**
- 40% longitud mínima
- 40% keywords
- 20% estructura (ambas partes + palabras de refutación)

**Formato de respuesta:**
```jsonb
{
  "argument": "Las redes sociales han democratizado...",
  "counterargument": "Sin embargo, esta democratización también..."
}
```

**⚠️ Requiere revisión manual del profesor**

#### 13. Análisis de Fuentes (`analisis_fuentes`)
**Definición:** Evaluación de credibilidad, sesgo y confiabilidad de fuentes.

**Características:**
- Validación: Multiple choice
- Partial credit: Sí
- Critical questions: Peso adicional (bonus 5 puntos)

**Formato de respuesta:**
```jsonb
{
  "questions": {
    "q1": "option_a",  // credibilidad
    "q2": "option_c",  // sesgo
    "q3": "option_b"   // confiabilidad
  }
}
```

#### 14. Podcast Argumentativo (`podcast_argumentativo`)
**Definición:** Submission de audio con argumentación.

**Características:**
- Validación: **TÉCNICA** (NO valida contenido)
- Criterios técnicos:
  - Formato válido (mp3, m4a, wav, ogg, aac)
  - Duración: 120-600 segundos
  - Tamaño: < 50 MB
  - Metadata: título + descripción

**Criterios de validación:**
- 30% formato válido
- 40% duración válida
- 20% tamaño válido
- 10% metadata completo

**Formato de respuesta:**
```jsonb
{
  "audio_url": "https://storage.example.com/audio/podcast-123.mp3",
  "duration_seconds": 240,
  "file_format": "mp3",
  "file_size_mb": 12.5,
  "title": "Análisis del Cambio Climático",
  "description": "Podcast argumentando sobre..."
}
```

**⚠️ Requiere revisión manual del profesor para evaluar contenido**

#### 15. Matriz de Perspectivas (`matriz_perspectivas`)
**Definición:** Análisis de un tema desde múltiples perspectivas.

**Características:**
- Validación: Completitud de celdas
- Longitud mínima por celda: 50 caracteres
- Keywords opcionales por perspectiva
- Partial credit: Sí

**Formato de respuesta:**
```jsonb
{
  "perspectives": {
    "perspective1": "Desde el punto de vista económico...",
    "perspective2": "Desde la perspectiva social...",
    "perspective3": "Ambientalmente..."
  }
}
```

---

## 🎯 Tipos de Validación

### 1. Validación Exacta
Comparación exacta de valores (con normalización opcional).

**Usada en:**
- Crucigrama
- Verdadero/Falso
- Multiple choice (detective_textual, puzzle_contexto, analisis_fuentes)
- Rueda de inferencias

### 2. Validación Fuzzy
Comparación por similitud usando trigram similarity.

**Usada en:**
- Completar espacios (opcional)

**Algoritmo:** `similarity(text1, text2) >= threshold`

### 3. Validación Secuencial
Verificación de orden correcto de elementos.

**Usada en:**
- Línea de tiempo

### 4. Validación Heurística
Criterios básicos (longitud + keywords) sin evaluar calidad.

**Usada en:**
- Construcción de hipótesis
- Predicción narrativa
- Tribunal de opiniones
- Debate digital

**⚠️ IMPORTANTE:** Estos ejercicios **SIEMPRE** requieren revisión manual del profesor.

### 5. Validación Técnica
Verificación de aspectos técnicos sin evaluar contenido.

**Usada en:**
- Podcast argumentativo (formato, duración, tamaño)

**⚠️ IMPORTANTE:** Requiere revisión manual para evaluar contenido argumentativo.

---

## 🔧 Configuración de Validación

Cada tipo de ejercicio tiene configuración en `exercise_validation_config`:

### Parámetros de Configuración

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `validation_function` | TEXT | Nombre de la función validadora |
| `case_sensitive` | BOOLEAN | Si distingue mayúsculas/minúsculas |
| `allow_partial_credit` | BOOLEAN | Si permite puntos parciales |
| `fuzzy_matching_threshold` | NUMERIC(3,2) | Umbral de similitud (0.00-1.00) |
| `normalize_text` | BOOLEAN | Si normaliza texto (acentos, espacios) |
| `special_rules` | JSONB | Reglas especiales por tipo |
| `default_max_points` | INTEGER | Puntos máximos por defecto |
| `default_passing_score` | INTEGER | Puntuación mínima para aprobar |

### Special Rules (JSONB)

Reglas específicas por tipo de ejercicio:

**Para validadores heurísticos:**
```jsonb
{
  "min_word_count": 20,
  "keywords_threshold": 0.60
}
```

**Para podcast:**
```jsonb
{
  "min_duration_seconds": 120,
  "max_duration_seconds": 600,
  "max_size_mb": 50.0,
  "allowed_formats": ["mp3", "m4a", "wav"]
}
```

**Para matriz:**
```jsonb
{
  "min_chars_per_cell": 50
}
```

---

## 📊 Sistema de Auditoría

### Snapshot Inmutable

Cada validación guarda 3 snapshots inmutables:

1. **`submitted_answer`**: Respuesta exacta del usuario
2. **`exercise_snapshot`**: Ejercicio completo (content, solution, max_points)
3. **`validation_config_snapshot`**: Configuración usada

### Campos de Resultado

```sql
is_correct: BOOLEAN       -- 100% correcto
score: INTEGER           -- Puntos obtenidos
max_score: INTEGER       -- Puntos máximos
feedback: TEXT           -- Mensaje para el usuario
validation_details: JSONB -- Detalles (resultados por pregunta, etc.)
```

### Campos de Recálculo

```sql
is_recalculated: BOOLEAN
recalculated_at: TIMESTAMP
recalculated_by: UUID
recalculation_reason: TEXT
original_audit_id: UUID
```

### Campos de Discrepancia

```sql
has_discrepancy: BOOLEAN
discrepancy_type: TEXT    -- 'score_changed' | 'correctness_changed'
discrepancy_notes: TEXT
```

### Tipos de Discrepancia

| Tipo | Descripción |
|------|-------------|
| `score_changed` | El score cambió pero is_correct se mantuvo |
| `correctness_changed` | is_correct cambió (false → true o viceversa) |

---

## 🎓 Niveles de Comprensión

### Nivel 1: Comprensión Literal
- **Objetivo:** Identificar información explícita
- **Tipos:** Crucigrama, línea de tiempo, sopa de letras, completar espacios, verdadero/falso
- **Validación:** Exacta o fuzzy

### Nivel 2: Comprensión Inferencial
- **Objetivo:** Hacer inferencias y deducciones
- **Tipos:** Detective textual, construcción de hipótesis, predicción narrativa, puzzle de contexto, rueda de inferencias
- **Validación:** Exacta (multiple choice) o heurística (respuestas abiertas)

### Nivel 3: Pensamiento Crítico
- **Objetivo:** Evaluar, analizar y argumentar
- **Tipos:** Tribunal de opiniones, debate digital, análisis de fuentes, podcast argumentativo, matriz de perspectivas
- **Validación:** Heurística o técnica + revisión manual

---

## 📝 Normalización de Texto

### Función: `gamilit.normalize_text()`

**Transformaciones:**
1. Remover acentos: á → a, é → e, í → i, ó → o, ú → u, ñ → n
2. Convertir a mayúsculas (opcional por validador)
3. Trim de espacios

**Ejemplo:**
```sql
SELECT gamilit.normalize_text('María José');
-- Resultado: 'MARIA JOSE'
```

---

## 🔒 Inmutabilidad de Auditoría

### Principio
Los registros de auditoría **NUNCA** se modifican o eliminan.

### Razones
1. **Trazabilidad legal:** Evidencia de lo que el usuario envió
2. **Recálculo:** Permite re-validar con snapshot original
3. **Análisis histórico:** Estadísticas y mejora continua
4. **Integridad:** No se puede alterar evidencia

### Correcciones
Si hay un error en la validación:
1. ❌ NO modificar el registro original
2. ✅ Crear nuevo registro con `is_recalculated = true`
3. ✅ Marcar ambos con `has_discrepancy = true`

---

## ⚠️ Limitaciones Conocidas

### 1. Validadores Heurísticos
**NO validan calidad del contenido:**
- construccion_hipotesis
- prediccion_narrativa
- tribunal_opiniones
- debate_digital

**Solo verifican:**
- ✅ Longitud mínima
- ✅ Presencia de keywords
- ✅ Estructura básica

### 2. Podcast Argumentativo
**Solo valida criterios técnicos:**
- ✅ Formato de audio
- ✅ Duración
- ✅ Tamaño de archivo
- ❌ NO valida contenido

### 3. Recálculo con Ejercicio Modificado
- La función `recalculate_exercise()` usa el ejercicio ACTUAL
- Si el ejercicio cambió, el recálculo puede dar resultado diferente
- El snapshot está disponible para recalcular con versión exacta

---

## 📚 Referencias

- **Handoff Frontend:** `HANDOFF-FE-059-TO-DB.md`
- **Handoff Backend:** `HANDOFF-DB-117-TO-BE.md`
- **Implementación:** `DB-117-EJECUCION.md`
- **Inventario:** `docs/inventario/INVENTARIO-COMPONENTES.md`

---

**Versión del documento:** 1.0
**Fecha de última actualización:** 2025-11-19
**Responsable:** Database Agent
