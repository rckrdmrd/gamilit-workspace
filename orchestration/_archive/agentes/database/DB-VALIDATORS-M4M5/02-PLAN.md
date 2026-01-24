# PLAN DE IMPLEMENTACIÓN: Validadores Básicos M4-M5

**Fecha:** 2025-11-29
**Agente:** Database-Agent
**Tarea:** DB-VALIDATORS-M4M5
**Estado:** Planeación

---

## 1. RESUMEN EJECUTIVO

### 1.1. Objetivo
Implementar función SQL `validate_module4_module5_answer()` que valide **SOLO ESTRUCTURA** de respuestas JSONB para ejercicios de Módulos 4 y 5.

### 1.2. Alcance
- ✅ Validación de estructura JSONB
- ✅ Detección de campos faltantes o mal formados
- ✅ Validación de tipos de datos
- ❌ NO evaluación de calidad de contenido
- ❌ NO autocorrección (siempre `requires_manual_review = true`)

---

## 2. ARQUITECTURA DE LA SOLUCIÓN

### 2.1. Función Principal

**Nombre:** `educational_content.validate_module4_module5_answer()`

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_module4_module5_answer(
    p_exercise_type educational_content.exercise_type,
    p_submitted_answer JSONB,
    p_max_points INTEGER DEFAULT 100,
    OUT is_valid BOOLEAN,
    OUT validation_errors TEXT[],
    OUT requires_manual_review BOOLEAN,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
```

**Parámetros:**
- `p_exercise_type`: Tipo de ejercicio (verificador_fake_news, diario_multimedia, etc.)
- `p_submitted_answer`: Respuesta del estudiante en formato JSONB
- `p_max_points`: Puntuación máxima (para contexto, no se usa en scoring)

**Retorno:**
- `is_valid`: TRUE si estructura es válida, FALSE si hay errores
- `validation_errors`: Array de mensajes de error (vacío si válido)
- `requires_manual_review`: SIEMPRE TRUE
- `details`: Información adicional de validación (métricas, estructura encontrada)

### 2.2. Flujo de Validación

```
┌─────────────────────────────────────────┐
│ validate_module4_module5_answer()       │
└─────────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Verificar JSONB     │
    │ no nulo             │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ CASE exercise_type  │
    └─────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │ M4: verificador_fake_news           │
    │   - claims_verified[] existe        │
    │   - Cada claim tiene estructura     │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M4: infografia_interactiva          │
    │   - answers{} existe                │
    │   - sections_explored[] existe      │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M4: quiz_tiktok                     │
    │   - answers[] es array de integers  │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M4: navegacion_hipertextual         │
    │   - path[] existe                   │
    │   - information_found{} existe      │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M4: analisis_memes                  │
    │   - annotations[] existe            │
    │   - analysis{} existe               │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M5: diario_multimedia               │
    │   - entries[] existe                │
    │   - Cada entrada tiene date/content │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M5: comic_digital                   │
    │   - panels[] existe                 │
    │   - Cada panel tiene dialogue/narr  │
    └─────────────────────────────────────┘
    ┌─────────────────────────────────────┐
    │ M5: video_carta                     │
    │   - video_url O script existe       │
    │   - duration > 0                    │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Construir resultado │
    │ - is_valid          │
    │ - validation_errors │
    │ - details           │
    └─────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ requires_manual_review=TRUE │
    └─────────────────────────────┘
```

---

## 3. ESPECIFICACIÓN DETALLADA POR TIPO

### 3.1. Módulo 4

#### verificador_fake_news
```sql
-- Estructura esperada
{
  "claims_verified": [
    {"claim_id": "c1", "is_fake": true, "evidence": "..."}
  ],
  "notes": "opcional"
}

-- Validaciones
✓ claims_verified existe y es array
✓ Array tiene >= 1 elemento
✓ Cada elemento tiene: claim_id (text), is_fake (boolean), evidence (text)
✓ claim_id no vacío
✓ evidence longitud >= 10
```

#### infografia_interactiva
```sql
-- Estructura esperada
{
  "answers": {"q1": "a1", "q2": "a2"},
  "sections_explored": ["intro", "timeline", "achievements"]
}

-- Validaciones
✓ answers existe y es objeto (no array)
✓ sections_explored existe y es array
✓ sections_explored tiene >= 1 elemento
```

#### quiz_tiktok
```sql
-- Estructura esperada
{
  "answers": [1, 2, 0, 3]
}

-- Validaciones
✓ answers existe y es array
✓ Array tiene >= 1 elemento
✓ Cada elemento es integer >= 0
```

#### navegacion_hipertextual
```sql
-- Estructura esperada
{
  "path": ["page1", "page2", "page3"],
  "information_found": {"fact1": "...", "fact2": "..."}
}

-- Validaciones
✓ path existe y es array
✓ path tiene >= 2 elementos (inicio → destino mínimo)
✓ information_found existe y es objeto
```

#### analisis_memes
```sql
-- Estructura esperada
{
  "annotations": [
    {"element": "texto superior", "interpretation": "ironía"}
  ],
  "analysis": {
    "tone": "humorístico",
    "message": "crítica social",
    "effectiveness": "alta"
  }
}

-- Validaciones
✓ annotations existe y es array
✓ Cada anotación tiene: element (text), interpretation (text)
✓ analysis existe y es objeto
✓ analysis.message existe y no vacío
```

### 3.2. Módulo 5

#### diario_multimedia
```sql
-- Estructura esperada
{
  "entries": [
    {
      "date": "1898-12-26",
      "content": "Hoy descubrimos el Radio...",
      "multimedia": "uuid-opcional"
    }
  ]
}

-- Validaciones
✓ entries existe y es array
✓ Array tiene >= 1 elemento
✓ Cada entrada tiene: date (text formato fecha), content (text >= 50 chars)
✓ content no vacío y longitud >= 50
```

#### comic_digital
```sql
-- Estructura esperada
{
  "panels": [
    {
      "image": "uuid-opcional",
      "dialogue": "¡Eureka!",
      "narration": "Marie en el laboratorio"
    }
  ]
}

-- Validaciones
✓ panels existe y es array
✓ Array tiene >= 3 elementos (mínimo 3 viñetas)
✓ Cada panel tiene: dialogue O narration (al menos uno)
```

#### video_carta
```sql
-- Estructura esperada
{
  "video_url": "https://...",  -- O
  "script": "Texto del guión...",
  "duration": 120  -- segundos
}

-- Validaciones
✓ video_url O script existe (al menos uno)
✓ duration existe y es integer > 0
✓ Si existe script: longitud >= 100 caracteres
```

---

## 4. IMPLEMENTACIÓN

### 4.1. Archivo a Crear

**Ruta:** `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

**Secciones del archivo:**
1. Header con metadatos
2. Función principal
3. Helpers internos (validación JSONB)
4. Comentarios SQL
5. Permisos
6. Ejemplos de uso

### 4.2. Pseudocódigo

```sql
CREATE OR REPLACE FUNCTION validate_module4_module5_answer(...)
RETURNS RECORD AS $$
DECLARE
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_details JSONB := '{}'::jsonb;
BEGIN
    -- 1. Validación básica
    IF p_submitted_answer IS NULL OR p_submitted_answer = 'null'::jsonb THEN
        v_errors := array_append(v_errors, 'Respuesta vacía o nula');
        is_valid := false;
        RETURN;
    END IF;

    -- 2. CASE por exercise_type
    CASE p_exercise_type

        WHEN 'verificador_fake_news' THEN
            -- Validar claims_verified[]
            IF NOT (p_submitted_answer ? 'claims_verified') THEN
                v_errors := array_append(v_errors, 'Falta campo claims_verified');
            ELSIF jsonb_typeof(p_submitted_answer->'claims_verified') != 'array' THEN
                v_errors := array_append(v_errors, 'claims_verified debe ser un array');
            ELSIF jsonb_array_length(p_submitted_answer->'claims_verified') = 0 THEN
                v_errors := array_append(v_errors, 'claims_verified no puede estar vacío');
            ELSE
                -- Validar estructura de cada claim
                FOR i IN 0..jsonb_array_length(p_submitted_answer->'claims_verified')-1
                LOOP
                    v_claim := p_submitted_answer->'claims_verified'->i;
                    IF NOT (v_claim ? 'claim_id' AND v_claim ? 'is_fake' AND v_claim ? 'evidence') THEN
                        v_errors := array_append(v_errors, format('Claim %s: faltan campos', i));
                    END IF;
                    -- Validar tipos...
                END LOOP;
            END IF;

        WHEN 'diario_multimedia' THEN
            -- Similar...

        -- ... otros tipos

        ELSE
            v_errors := array_append(v_errors, format('Tipo de ejercicio no soportado: %s', p_exercise_type));

    END CASE;

    -- 3. Construir resultado
    is_valid := (array_length(v_errors, 1) IS NULL OR array_length(v_errors, 1) = 0);
    validation_errors := COALESCE(v_errors, ARRAY[]::TEXT[]);
    requires_manual_review := TRUE;  -- SIEMPRE
    details := v_details;

END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 4.3. Funciones Helper

**Opcional:** Crear funciones internas para validación común:

```sql
-- Helper: Validar que campo existe y es tipo específico
CREATE OR REPLACE FUNCTION _validate_field_type(
    p_json JSONB,
    p_field TEXT,
    p_expected_type TEXT  -- 'array', 'object', 'string', 'number', 'boolean'
)
RETURNS TEXT AS $$
BEGIN
    IF NOT (p_json ? p_field) THEN
        RETURN format('Campo "%s" faltante', p_field);
    ELSIF jsonb_typeof(p_json->p_field) != p_expected_type THEN
        RETURN format('Campo "%s" debe ser de tipo %s', p_field, p_expected_type);
    END IF;
    RETURN NULL;  -- Sin error
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**DECISIÓN:** Implementar helpers inline dentro de la función principal para simplicidad (no crear funciones separadas).

---

## 5. TESTING

### 5.1. Test Cases

#### Caso 1: verificador_fake_news - Válido
```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'verificador_fake_news',
    '{
        "claims_verified": [
            {"claim_id": "c1", "is_fake": true, "evidence": "Evidencia aquí"}
        ]
    }'::jsonb,
    100
);
-- Esperado: is_valid=TRUE, validation_errors=[], requires_manual_review=TRUE
```

#### Caso 2: verificador_fake_news - Inválido
```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'verificador_fake_news',
    '{
        "claims_verified": "not-an-array"
    }'::jsonb,
    100
);
-- Esperado: is_valid=FALSE, validation_errors=['claims_verified debe ser un array']
```

#### Caso 3: diario_multimedia - Válido
```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'diario_multimedia',
    '{
        "entries": [
            {
                "date": "1898-12-26",
                "content": "Lorem ipsum dolor sit amet consectetur adipiscing elit..."
            }
        ]
    }'::jsonb,
    500
);
-- Esperado: is_valid=TRUE
```

#### Caso 4: comic_digital - Inválido (pocos paneles)
```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'comic_digital',
    '{
        "panels": [
            {"dialogue": "Hola"}
        ]
    }'::jsonb,
    500
);
-- Esperado: is_valid=FALSE, validation_errors=['Mínimo 3 paneles requeridos']
```

### 5.2. Validación con create-database.sh

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
./create-database.sh
```

**Criterios de éxito:**
- ✅ Script completa sin errores
- ✅ Función se crea correctamente
- ✅ Permisos asignados
- ✅ Comentarios visibles con `\df+`

---

## 6. DOCUMENTACIÓN

### 6.1. Comentarios SQL

```sql
COMMENT ON FUNCTION educational_content.validate_module4_module5_answer IS
'Validador de estructura JSONB para ejercicios de Módulos 4 y 5.
NO evalúa calidad de contenido (eso es responsabilidad del docente).
SÍ valida que la estructura de respuesta sea correcta.
SIEMPRE retorna requires_manual_review=TRUE.

Tipos soportados:
- M4: verificador_fake_news, infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes
- M5: diario_multimedia, comic_digital, video_carta

Retorna:
- is_valid: TRUE si estructura válida
- validation_errors: Array de mensajes de error
- requires_manual_review: Siempre TRUE
- details: Información adicional de validación';
```

### 6.2. Actualización de Inventarios

**Archivo:** `orchestration/inventarios/DATABASE_INVENTORY.yml`

```yaml
educational_content:
  functions: 32  # Era 31
  validators_by_module:
    module_1: 7
    module_2: 6
    module_3: 5
    module_4: 5  # ← NUEVO (1 función maneja 5 tipos)
    module_5: 3  # ← NUEVO (1 función maneja 3 tipos)
    generic: 4
  notes: "2025-11-29: validate_module4_module5_answer agregada para validación de estructura de ejercicios creativos"
```

---

## 7. CRONOGRAMA

| Fase | Tarea | Tiempo Estimado | Estado |
|------|-------|----------------|--------|
| 1 | Análisis | 30 min | ✅ Completado |
| 2 | Planeación | 30 min | 🔄 En progreso |
| 3 | Implementación función | 60 min | ⏸️ Pendiente |
| 4 | Testing manual | 20 min | ⏸️ Pendiente |
| 5 | Validación carga limpia | 10 min | ⏸️ Pendiente |
| 6 | Documentación | 20 min | ⏸️ Pendiente |
| **TOTAL** | | **2h 50min** | |

---

## 8. CRITERIOS DE ACEPTACIÓN

### 8.1. Funcionales
- ✅ Función `validate_module4_module5_answer()` creada
- ✅ Valida estructura para 8 tipos de ejercicios (5 M4 + 3 M5)
- ✅ Retorna errores descriptivos si estructura inválida
- ✅ SIEMPRE retorna `requires_manual_review = true`
- ✅ NO evalúa contenido (solo estructura)

### 8.2. Técnicos
- ✅ Función `IMMUTABLE` (puede cachear resultados)
- ✅ Comentarios SQL completos
- ✅ Permisos correctos (authenticated, admin_teacher)
- ✅ Ejemplos de uso documentados

### 8.3. Calidad
- ✅ `create-database.sh` completa sin errores
- ✅ Tests manuales pasan
- ✅ Inventarios actualizados
- ✅ Trazas documentadas

---

## 9. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| JSONB mal formado causa error | Media | Bajo | Validación NULL/tipo al inicio |
| Nuevos campos en futuro | Media | Bajo | Función IMMUTABLE permite recrear fácilmente |
| Backend no usa función | Baja | Alto | Documentar integración en handoff |

---

## 10. PRÓXIMOS PASOS

1. ✅ Análisis completado (01-ANALISIS.md)
2. ✅ Plan completado (02-PLAN.md)
3. ⏭️ Implementar función SQL (23-validate_module4_module5.sql)
4. ⏭️ Validar con carga limpia
5. ⏭️ Documentar en 05-DOCUMENTACION.md

---

**Fecha finalización plan:** 2025-11-29
**Próxima fase:** Implementación SQL
