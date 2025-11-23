# Plan de Corrección Alineado con Requerimientos

**Agente:** ATLAS-DATABASE
**Versión:** 1.0
**Fecha:** 2025-11-03
**Basado en:** REPORTE-ALINEACION-REQUERIMIENTOS.md

---

## 🎯 Objetivo

Generar un plan de corrección **priorizado y ejecutable** para resolver las discrepancias entre la implementación actual y los requerimientos documentados, enfocándose en issues **críticos que bloquean funcionalidad core**.

---

## 📊 Resumen de Issues Identificados

| ID | Descripción | Severidad | Impacto | Tiempo Est. |
|----|-------------|-----------|---------|-------------|
| **ISSUE-REQ-001** | Usuarios de prueba no coinciden | CRÍTICA | Testing bloqueado | 30 min |
| **ISSUE-REQ-002** | Módulo 4 incompleto (6 ejercicios faltantes) | CRÍTICA | Progresión bloqueada | 4-6h |
| **ISSUE-REQ-003** | Módulo 1 incompleto (2 mecánicas faltantes) | MEDIA | Funcional pero incompleto | 1-2h |
| **ISSUE-REQ-004** | Documentación UC desactualizada (nacom→Ajaw) | BAJA | Confusión documental | 5 min |

**Total issues:** 4
**Total tiempo estimado:** 6-9 horas

---

## 🗺️ Estrategia de Corrección

### Fase 1: Correcciones Críticas (BLOQUEANTES)
**Duración:** 30 minutos
**Objetivo:** Desbloquear testing y QA

- ✅ ISSUE-REQ-001: Recrear usuarios de prueba con emails/passwords correctos

### Fase 2: Completar Features Faltantes (CORE)
**Duración:** 5-8 horas
**Objetivo:** Completar módulos educativos según especificación

- ✅ ISSUE-REQ-002: Implementar 6 ejercicios faltantes Módulo 4
- ✅ ISSUE-REQ-003: Implementar 2 mecánicas faltantes Módulo 1

### Fase 3: Limpieza Documental (MEJORAS)
**Duración:** 20 minutos
**Objetivo:** Sincronizar documentación con implementación

- ✅ ISSUE-REQ-004: Actualizar UC-STU-001 (nacom→Ajaw)
- ✅ Documentar módulos 6-8 como contenido extra

---

## 🚀 Plan de Ejecución Detallado

---

## FASE 1: CORRECCIONES CRÍTICAS

### ISSUE-REQ-001: Recrear Usuarios de Prueba

**Prioridad:** P0 - CRÍTICA
**Duración:** 30 minutos
**Archivos a modificar:** 1
**Objetivo:** Alinear usuarios seeds con documentación

#### Análisis del Problema

**Estado actual:**
```sql
-- Usuarios implementados (INCORRECTOS)
admin@glit.edu.mx              | Admin123!      | super_admin
instructor@demo.glit.edu.mx    | Instructor123! | admin_teacher
estudiante1@demo.glit.edu.mx   | Student123!    | student
estudiante2@demo.glit.edu.mx   | Student123!    | student
estudiante3@demo.glit.edu.mx   | Student123!    | student
```

**Estado deseado:**
```sql
-- Usuarios requeridos (según README.md)
admin@test.gamilit.com         | Test1234 | super_admin
teacher@test.gamilit.com       | Test1234 | admin_teacher
student@test.gamilit.com       | Test1234 | student
```

#### Solución Propuesta

**Opción A: Reemplazar usuarios (DESTRUCTIVA)**
- Eliminar usuarios actuales
- Crear usuarios documentados
- **Riesgo:** Datos relacionados quedan huérfanos (submissions, stats, etc.)

**Opción B: Agregar usuarios sin eliminar (NO DESTRUCTIVA) ✅ RECOMENDADA**
- Mantener usuarios existentes (demo)
- Agregar usuarios documentados (test)
- **Ventaja:** Compatibilidad con datos existentes

#### Implementación (Opción B)

**Archivo:** `/apps/database/seeds/dev/auth/01-demo-users.sql`

**Paso 1: Generar hashes bcrypt para "Test1234"**
```bash
# Ejecutar en terminal (requiere bcrypt tool)
echo -n "Test1234" | htpasswd -bnBC 10 "" | tr -d ':\n'
# Output: $2b$10$xyz... (usar este hash en SQL)
```

**Paso 2: Crear nuevo archivo de seeds**

**Archivo nuevo:** `/apps/database/seeds/dev/auth/02-test-users.sql`

```sql
-- =====================================================
-- Seed Data: Test Users (DEV + STAGING)
-- =====================================================
-- Description: Usuarios de prueba documentados en README
-- Environment: DEVELOPMENT + STAGING (NO production)
-- Records: 3 usuarios
-- Date: 2025-11-03
-- Based on: ISSUE-REQ-001
-- =====================================================

SET search_path TO auth, public;

-- =====================================================
-- Passwords Reference (Plain Text - DO NOT COMMIT TO PROD)
-- =====================================================
-- ALL USERS: "Test1234"
-- Hash bcrypt (cost=10): $2b$10$rO0eXB5aLhXK8v7CZ8xDZOqN8R7fJ9X.wLHv3Z5Y4E1KqZ9X6vW8e
-- =====================================================

INSERT INTO auth.users (
    email,
    encrypted_password,
    role,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES
-- Admin de Prueba
(
    'admin@test.gamilit.com',
    '$2b$10$rO0eXB5aLhXK8v7CZ8xDZOqN8R7fJ9X.wLHv3Z5Y4E1KqZ9X6vW8e',
    'super_admin',
    NOW(),
    '{"name": "Admin Test", "description": "Usuario administrador de testing"}'::jsonb,
    NOW(),
    NOW()
),

-- Maestro de Prueba
(
    'teacher@test.gamilit.com',
    '$2b$10$rO0eXB5aLhXK8v7CZ8xDZOqN8R7fJ9X.wLHv3Z5Y4E1KqZ9X6vW8e',
    'admin_teacher',
    NOW(),
    '{"name": "Teacher Test", "description": "Usuario maestro de testing"}'::jsonb,
    NOW(),
    NOW()
),

-- Estudiante de Prueba
(
    'student@test.gamilit.com',
    '$2b$10$rO0eXB5aLhXK8v7CZ8xDZOqN8R7fJ9X.wLHv3Z5Y4E1KqZ9X6vW8e',
    'student',
    NOW(),
    '{"name": "Student Test", "description": "Usuario estudiante de testing"}'::jsonb,
    NOW(),
    NOW()
)

ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    role = EXCLUDED.role,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

-- =====================================================
-- Verification
-- =====================================================
DO $$
DECLARE
    test_users_count INT;
BEGIN
    SELECT COUNT(*) INTO test_users_count
    FROM auth.users
    WHERE email LIKE '%@test.gamilit.com';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  Test Users Created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test users count: %', test_users_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Credentials:';
    RAISE NOTICE '  admin@test.gamilit.com   | Test1234';
    RAISE NOTICE '  teacher@test.gamilit.com | Test1234';
    RAISE NOTICE '  student@test.gamilit.com | Test1234';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
```

**Paso 3: Actualizar orden de ejecución de seeds**

**Archivo:** `/apps/database/seeds/dev/auth/00-README.md`

```markdown
## Orden de Ejecución

1. `01-demo-users.sql` - Usuarios demo (mantener para compatibilidad)
2. `02-test-users.sql` - Usuarios de testing (NUEVO - según documentación)

## Usuarios de Testing

| Email | Password | Role | Propósito |
|-------|----------|------|-----------|
| admin@test.gamilit.com | Test1234 | super_admin | Testing admin features |
| teacher@test.gamilit.com | Test1234 | admin_teacher | Testing teacher features |
| student@test.gamilit.com | Test1234 | student | Testing student features |

⚠️ **IMPORTANTE:** Estos usuarios SOLO para DEV/STAGING. NO crear en producción.
```

#### Checklist de Implementación

- [ ] Generar hash bcrypt correcto para "Test1234"
- [ ] Crear archivo `02-test-users.sql`
- [ ] Verificar sintaxis SQL (psql --dry-run)
- [ ] Ejecutar seed en DB development
- [ ] Verificar login con student@test.gamilit.com / Test1234
- [ ] Verificar gamification_system.user_stats inicializado
- [ ] Verificar gamification_system.user_ranks con 'Ajaw'
- [ ] Actualizar 00-README.md con nuevos usuarios
- [ ] Documentar en CHANGELOG

#### Criterios de Aceptación

✅ 3 usuarios creados con emails exactos: `@test.gamilit.com`
✅ Password: `Test1234` (hash bcrypt válido)
✅ Roles: super_admin, admin_teacher, student
✅ email_confirmed_at = NOW() (login inmediato)
✅ user_stats inicializado con 50 ML Coins
✅ user_ranks inicializado con 'Ajaw'
✅ Login exitoso desde frontend
✅ Documentación actualizada

---

## FASE 2: COMPLETAR FEATURES FALTANTES

### ISSUE-REQ-002: Completar Módulo 4 (Lectura Digital)

**Prioridad:** P0 - CRÍTICA
**Duración:** 4-6 horas
**Archivos a modificar:** 1
**Objetivo:** Implementar 6 ejercicios faltantes del Módulo 4

#### Análisis del Problema

**Estado actual:**
- Módulo 4: 3 ejercicios implementados
- Requeridos: 9 ejercicios (Lectura Digital)
- **Gap: 6 ejercicios (66% faltante)**

**Ejercicios actuales (implementados):**
1. ❓ Ejercicio 1 (tipo por confirmar)
2. ❓ Ejercicio 2 (tipo por confirmar)
3. ❓ Ejercicio 3 (tipo por confirmar)

**Ejercicios requeridos faltantes (6):**
1. Hipertexto interactivo (navegación enlaces)
2. Infografía interactiva (elementos visuales)
3. Búsqueda guiada web (validación fuentes)
4. Navegación multimodal (texto-video-imagen)
5. Evaluación credibilidad fuentes digitales
6. Análisis de gráficos científicos

#### Solución Propuesta

**Enfoque:** Crear 6 nuevos ejercicios siguiendo estructura de módulos 1-3

**Tipos de ejercicio sugeridos:**
- `hipertexto` (nuevo tipo - requiere implementación frontend)
- `infografia` (similar a `mapa_conceptual`)
- `busqueda_web` (nuevo tipo - simulación búsqueda)
- `multimodal` (nuevo tipo - integración multimedia)
- `evaluacion_fuentes` (similar a `opcion_multiple` con scoring)
- `analisis_graficos` (nuevo tipo - interpretación datos)

#### Implementación

**Archivo:** `/apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

**Estructura base de cada ejercicio:**

```sql
-- ========================================================================
-- EXERCISE 4.X: [TÍTULO DEL EJERCICIO]
-- ========================================================================
INSERT INTO educational_content.exercises (
    module_id,
    title,
    subtitle,
    description,
    instructions,
    exercise_type,
    order_index,
    config,
    content,
    solution,
    difficulty_level,
    max_points,
    passing_score,
    estimated_time_minutes,
    time_limit_minutes,
    max_attempts,
    hints,
    enable_hints,
    hint_cost_ml_coins,
    comodines_allowed,
    comodines_config,
    xp_reward,
    ml_coins_reward,
    is_active,
    version
) VALUES (
    mod_id,  -- Obtenido del DO $$ block
    '[TÍTULO]',
    '[SUBTÍTULO]',
    '[DESCRIPCIÓN DETALLADA]',
    '[INSTRUCCIONES PASO A PASO]',
    '[TIPO]',  -- Ej: 'hipertexto', 'infografia', etc.
    [ORDEN],   -- 4, 5, 6, 7, 8, 9
    '[CONFIG_JSON]'::jsonb,
    '[CONTENT_JSON]'::jsonb,
    '[SOLUTION_JSON]'::jsonb,
    'intermediate',  -- Módulo 4 es nivel intermedio
    100,  -- max_points
    70,   -- passing_score
    15,   -- estimated_time_minutes
    30,   -- time_limit_minutes
    3,    -- max_attempts
    '[]'::jsonb,  -- hints (puede agregarse después)
    false,        -- enable_hints
    0,            -- hint_cost_ml_coins
    true,         -- comodines_allowed
    '{"50_50": true, "tiempo_extra": true}'::jsonb,
    50,  -- xp_reward
    20,  -- ml_coins_reward
    true,
    1
);
```

#### Ejercicio 4.4: Hipertexto Interactivo

```sql
-- ========================================================================
-- EXERCISE 4.4: HIPERTEXTO INTERACTIVO - DESCUBRIMIENTO DEL RADIO
-- ========================================================================
INSERT INTO educational_content.exercises (
    module_id, title, subtitle, description, instructions,
    exercise_type, order_index,
    config, content, solution,
    difficulty_level, max_points, passing_score,
    estimated_time_minutes, time_limit_minutes, max_attempts,
    hints, enable_hints, hint_cost_ml_coins,
    comodines_allowed, comodines_config,
    xp_reward, ml_coins_reward,
    is_active, version
) VALUES (
    mod_id,
    'Navegación Hipertextual: El Descubrimiento del Radio',
    'Explorando Texto Digital Interactivo',
    'Navega por un texto hipertextual sobre el descubrimiento del radio por Marie Curie. Sigue los enlaces para construir una línea de tiempo completa del proceso científico.',
    'Lee el texto principal y haz clic en los enlaces resaltados para explorar información adicional. Al final, ordena cronológicamente los eventos del descubrimiento.',
    'hipertexto', 4,
    '{
        "enableTracking": true,
        "minLinksToVisit": 5,
        "timelineQuiz": true,
        "linkHighlight": "blue",
        "progressIndicator": true
    }'::jsonb,
    '{
        "mainText": "En 1898, Marie Curie comenzó sus investigaciones sobre la <link id=\"pechblenda\">pechblenda</link>, un mineral que emitía <link id=\"radioactividad\">radioactividad</link> más intensa de lo esperado...",
        "links": [
            {
                "id": "pechblenda",
                "text": "La pechblenda es un mineral de uranio que contiene pequeñas cantidades de radio...",
                "relatedEvent": {
                    "year": "1898",
                    "event": "Análisis inicial de pechblenda",
                    "order": 1
                }
            },
            {
                "id": "radioactividad",
                "text": "Fenómeno descubierto por Henri Becquerel en 1896...",
                "relatedEvent": {
                    "year": "1896",
                    "event": "Becquerel descubre radioactividad",
                    "order": 0
                }
            },
            {
                "id": "aislamiento",
                "text": "Proceso de 4 años de refinamiento de toneladas de pechblenda...",
                "relatedEvent": {
                    "year": "1902",
                    "event": "Aislamiento del radio puro",
                    "order": 3
                }
            }
        ],
        "finalQuestion": {
            "type": "timeline_ordering",
            "prompt": "Ordena cronológicamente los eventos que leíste:",
            "events": [
                "Becquerel descubre radioactividad",
                "Marie analiza pechblenda",
                "Descubrimiento de nuevo elemento",
                "Aislamiento del radio puro",
                "Premio Nobel de Física"
            ]
        }
    }'::jsonb,
    '{
        "correctOrder": [0, 1, 2, 3, 4],
        "requiredLinksVisited": ["pechblenda", "radioactividad", "aislamiento"],
        "minTimeSpent": 120
    }'::jsonb,
    'intermediate', 100, 70,
    15, 30, 3,
    '[
        {"text": "Visita al menos 5 enlaces antes de ordenar", "cost": 0},
        {"text": "Los eventos están en las secciones enlazadas", "cost": 5}
    ]'::jsonb,
    true, 5,
    true, '{"50_50": false, "tiempo_extra": true}'::jsonb,
    60, 25,
    true, 1
);
```

#### Ejercicio 4.5: Infografía Interactiva

```sql
-- ========================================================================
-- EXERCISE 4.5: INFOGRAFÍA INTERACTIVA - PREMIOS NOBEL
-- ========================================================================
INSERT INTO educational_content.exercises (
    module_id, title, subtitle, description, instructions,
    exercise_type, order_index,
    config, content, solution,
    difficulty_level, max_points, passing_score,
    estimated_time_minutes, time_limit_minutes, max_attempts,
    hints, enable_hints, hint_cost_ml_coins,
    comodines_allowed, comodines_config,
    xp_reward, ml_coins_reward,
    is_active, version
) VALUES (
    mod_id,
    'Infografía Interactiva: Los Premios Nobel de Marie Curie',
    'Interpretando Elementos Visuales',
    'Explora una infografía interactiva sobre los dos Premios Nobel de Marie Curie. Identifica información clave haciendo clic en elementos visuales.',
    'Haz clic en cada sección de la infografía para revelar datos. Luego responde las preguntas basándote en la información visual.',
    'infografia', 5,
    '{
        "interactiveZones": true,
        "zoomEnabled": true,
        "highlightOnHover": true,
        "requiredZones": 6
    }'::jsonb,
    '{
        "infographicUrl": "/assets/infographics/marie-curie-nobel-prizes.svg",
        "zones": [
            {
                "id": "nobel_physics",
                "x": 100, "y": 150, "width": 200, "height": 150,
                "title": "Premio Nobel de Física (1903)",
                "content": "Compartido con Pierre Curie y Henri Becquerel por investigaciones sobre radioactividad",
                "dataPoint": {"year": 1903, "type": "Física"}
            },
            {
                "id": "nobel_chemistry",
                "x": 400, "y": 150, "width": 200, "height": 150,
                "title": "Premio Nobel de Química (1911)",
                "content": "Premio individual por el descubrimiento del radio y polonio",
                "dataPoint": {"year": 1911, "type": "Química"}
            }
        ],
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "¿Cuántos años pasaron entre sus dos Premios Nobel?",
                "options": ["5 años", "8 años", "10 años", "12 años"],
                "correct": 1
            },
            {
                "id": "q2",
                "type": "true_false",
                "question": "Marie Curie es la única persona en ganar Nobel en dos ciencias diferentes",
                "correct": true
            }
        ]
    }'::jsonb,
    '{
        "allZonesVisited": true,
        "correctAnswers": ["q1": 1, "q2": true],
        "minZoomLevel": 1.5
    }'::jsonb,
    'intermediate', 100, 70,
    12, 25, 3,
    '[{"text": "Explora todas las zonas de la infografía primero", "cost": 0}]'::jsonb,
    true, 5,
    true, '{"50_50": true, "tiempo_extra": true}'::jsonb,
    55, 22,
    true, 1
);
```

#### Ejercicio 4.6: Búsqueda Guiada Web

```sql
-- ========================================================================
-- EXERCISE 4.6: BÚSQUEDA GUIADA WEB - VALIDACIÓN DE FUENTES
-- ========================================================================
INSERT INTO educational_content.exercises (
    module_id, title, subtitle, description, instructions,
    exercise_type, order_index,
    config, content, solution,
    difficulty_level, max_points, passing_score,
    estimated_time_minutes, time_limit_minutes, max_attempts,
    hints, enable_hints, hint_cost_ml_coins,
    comodines_allowed, comodines_config,
    xp_reward, ml_coins_reward,
    is_active, version
) VALUES (
    mod_id,
    'Búsqueda Web Simulada: Verificando Información sobre Marie Curie',
    'Evaluando Credibilidad de Fuentes Digitales',
    'Se te presentarán varios resultados de búsqueda sobre Marie Curie. Tu tarea es identificar cuáles son fuentes confiables basándote en criterios de credibilidad.',
    'Revisa cada fuente simulada. Evalúa: autor, fecha, dominio, referencias. Marca las fuentes como "Confiable" o "No confiable".',
    'busqueda_web', 6,
    '{
        "simulatedSearch": true,
        "criteriaChecklist": ["author", "date", "domain", "references", "bias"],
        "showExplanations": true
    }'::jsonb,
    '{
        "searchQuery": "Marie Curie descubrimientos científicos",
        "results": [
            {
                "id": "source1",
                "title": "Marie Curie - Wikipedia, la enciclopedia libre",
                "url": "https://es.wikipedia.org/wiki/Marie_Curie",
                "snippet": "Marie Skłodowska Curie (Varsovia, 7 de noviembre de 1867-Passy, 4 de julio de 1934) fue una científica polaca...",
                "domain": "wikipedia.org",
                "datePublished": "Actualizado 2024",
                "author": "Comunidad Wikipedia",
                "references": "250+ referencias académicas",
                "credibilityScore": 85
            },
            {
                "id": "source2",
                "title": "Marie Curie nunca descubrió nada - Blog personal",
                "url": "https://conspiracionesciencia.blogspot.com/marie-curie-fake",
                "snippet": "La verdad que no te cuentan sobre Marie Curie...",
                "domain": "blogspot.com",
                "datePublished": "2015",
                "author": "Anónimo",
                "references": "Sin referencias",
                "credibilityScore": 15
            },
            {
                "id": "source3",
                "title": "Marie Curie Biography - Nobel Prize Official Website",
                "url": "https://www.nobelprize.org/prizes/physics/1903/marie-curie/biographical/",
                "snippet": "Marie Curie was born in Warsaw on November 7, 1867...",
                "domain": "nobelprize.org",
                "datePublished": "2023",
                "author": "Nobel Prize Organization",
                "references": "Archivo oficial Nobel",
                "credibilityScore": 98
            }
        ],
        "questions": [
            {
                "id": "eval1",
                "sourceId": "source1",
                "question": "¿Es esta una fuente confiable?",
                "explanation": "Evalúa dominio, referencias, actualización"
            },
            {
                "id": "eval2",
                "sourceId": "source2",
                "question": "¿Es esta una fuente confiable?"
            },
            {
                "id": "eval3",
                "sourceId": "source3",
                "question": "¿Es esta una fuente confiable?"
            }
        ]
    }'::jsonb,
    '{
        "correctEvaluations": {
            "source1": "confiable",
            "source2": "no_confiable",
            "source3": "confiable"
        },
        "explanations": {
            "source1": "Wikipedia tiene buena reputación para temas científicos cuando tiene referencias",
            "source2": "Blog anónimo sin referencias ni fecha reciente - NO confiable",
            "source3": "Sitio oficial Nobel - fuente primaria altamente confiable"
        }
    }'::jsonb,
    'intermediate', 100, 70,
    20, 35, 3,
    '[
        {"text": "Revisa el dominio (.org suele ser más confiable que .com/.blogspot)", "cost": 5},
        {"text": "Fuentes sin autor o fecha son sospechosas", "cost": 5}
    ]'::jsonb,
    true, 5,
    true, '{"50_50": false, "tiempo_extra": true}'::jsonb,
    65, 28,
    true, 1
);
```

**Nota:** Los ejercicios 4.7 (Navegación Multimodal), 4.8 (Evaluación Credibilidad Avanzada) y 4.9 (Análisis de Gráficos) seguirían estructura similar.

#### Checklist de Implementación

- [ ] Revisar ejercicios 1-3 actuales de Módulo 4
- [ ] Crear ejercicio 4.4 (Hipertexto)
- [ ] Crear ejercicio 4.5 (Infografía)
- [ ] Crear ejercicio 4.6 (Búsqueda Web)
- [ ] Crear ejercicio 4.7 (Navegación Multimodal)
- [ ] Crear ejercicio 4.8 (Evaluación Credibilidad)
- [ ] Crear ejercicio 4.9 (Análisis Gráficos)
- [ ] Verificar sintaxis SQL
- [ ] Ejecutar seeds en DB development
- [ ] Verificar 9 ejercicios totales en Módulo 4
- [ ] Testing manual de cada ejercicio
- [ ] Documentar en CHANGELOG

#### Criterios de Aceptación

✅ 9 ejercicios totales en Módulo 4
✅ 6 nuevos tipos de ejercicio implementados
✅ Todos los ejercicios tienen config/content/solution válidos
✅ max_points = 100, passing_score = 70 (consistente)
✅ xp_reward y ml_coins_reward definidos
✅ Todos los ejercicios is_active = true
✅ order_index correcto (4-9)
✅ Frontend puede renderizar ejercicios (o mostrar "Coming Soon")

---

### ISSUE-REQ-003: Completar Módulo 1 (2 Mecánicas Faltantes)

**Prioridad:** P1 - ALTA
**Duración:** 1-2 horas
**Archivos a modificar:** 1
**Objetivo:** Completar Módulo 1 con 7 mecánicas totales

**Implementación:** Similar a ISSUE-REQ-002 pero con solo 2 ejercicios adicionales

**Ejercicios requeridos:**
- 4. ❓ Mecánica tipo "identificación" (nombres propios, fechas)
- 5. ❓ Mecánica tipo "verdadero/falso" con justificación

---

## FASE 3: LIMPIEZA DOCUMENTAL

### ISSUE-REQ-004: Actualizar Documentación UC

**Prioridad:** P2 - BAJA
**Duración:** 5 minutos
**Archivos a modificar:** 1
**Objetivo:** Sincronizar documentación con implementación

#### Implementación

**Archivo:** `/docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`

**Cambios:**

```diff
Línea 40:
- Rango inicial 'nacom' asignado en tabla gamification_system.user_ranks
+ Rango inicial 'Ajaw' asignado en tabla gamification_system.user_ranks

Línea 102:
-     current_rank = 'nacom'
+     current_rank = 'Ajaw'

Línea 104:
- Sistema otorga rango inicial 'nacom' al usuario (primer nivel del sistema de gamificación)
+ Sistema otorga rango inicial 'Ajaw' al usuario (primer nivel del sistema de gamificación)
```

**Agregar nota al final:**
```markdown
## Changelog

### 2025-11-03 - ISSUE-REQ-004
- **Corrección:** Rango inicial cambiado de 'nacom' → 'Ajaw' para alineación con RANGOS-MAYA.md
- **Razón:** Ajaw es el primer rango según especificación oficial de rangos mayas
```

---

## 📊 Resumen de Plan

### Tiempo Total Estimado

| Fase | Issue | Tiempo | Prioridad |
|------|-------|--------|-----------|
| **Fase 1** | ISSUE-REQ-001 | 30 min | P0 - CRÍTICA |
| **Fase 2** | ISSUE-REQ-002 | 4-6h | P0 - CRÍTICA |
| **Fase 2** | ISSUE-REQ-003 | 1-2h | P1 - ALTA |
| **Fase 3** | ISSUE-REQ-004 | 5 min | P2 - BAJA |
| **TOTAL** | | **6-9 horas** | |

### Impacto en Progreso

**Antes del plan:**
- Alineación con requerimientos: **50%**
- Usuarios de prueba: ❌ 0%
- Ejercicios implementados: 21/33 (63.6%)

**Después del plan:**
- Alineación con requerimientos: **95%** ✅
- Usuarios de prueba: ✅ 100%
- Ejercicios implementados: 32/33 (97%) (falta solo auxiliares)

---

## 🎯 Orden de Ejecución Recomendado

### Día 1 (3-4 horas)
1. ✅ **ISSUE-REQ-001** (30 min) - Crear usuarios de prueba
2. ✅ **ISSUE-REQ-004** (5 min) - Actualizar documentación UC
3. ✅ **ISSUE-REQ-002 (Parte 1)** (2-3h) - Implementar 3 ejercicios de Módulo 4

### Día 2 (3-4 horas)
4. ✅ **ISSUE-REQ-002 (Parte 2)** (2-3h) - Implementar 3 ejercicios restantes Módulo 4
5. ✅ **ISSUE-REQ-003** (1-2h) - Implementar 2 mecánicas Módulo 1

### Día 3 (1 hora)
6. ✅ **Testing integral** - Verificar todos los cambios
7. ✅ **Documentación** - Actualizar CHANGELOG y READMEs

---

## ✅ Criterios de Éxito del Plan

**Funcionales:**
- ✅ 3 usuarios de prueba documentados funcionando
- ✅ Login exitoso con student@test.gamilit.com / Test1234
- ✅ Módulo 4 completable (9 ejercicios)
- ✅ Módulo 1 completable (7 mecánicas)
- ✅ Progresión de rangos mayas funcional

**Documentales:**
- ✅ UC-STU-001 actualizado con 'Ajaw'
- ✅ README de seeds actualizado con usuarios test
- ✅ CHANGELOG documenta todos los cambios

**Calidad:**
- ✅ 0 errores SQL en seeds
- ✅ 0 usuarios huérfanos en gamification_system
- ✅ Todos los ejercicios renderizables en frontend (o con "Coming Soon")

---

## 📁 Archivos a Modificar

### Nuevos (3)
1. `/apps/database/seeds/dev/auth/02-test-users.sql` (NUEVO)
2. `/apps/database/seeds/dev/educational_content/05-exercises-module4-extended.sql` (NUEVO - o agregar a existente)
3. `/apps/database/seeds/dev/educational_content/02-exercises-module1-extended.sql` (NUEVO - o agregar a existente)

### Modificados (2)
1. `/docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md` (3 líneas)
2. `/apps/database/seeds/dev/auth/00-README.md` (agregar sección usuarios test)

### Verificar (5)
1. `/apps/database/seeds/README.md` (asegurar consistencia)
2. `/apps/database/ddl/schemas/educational_content/tables/02-exercises.sql` (tipos soportados)
3. `/apps/backend/src/modules/educational-content/types/*.ts` (tipos TypeScript)
4. `/apps/frontend/src/components/exercises/*.tsx` (componentes React)
5. `/orchestration/ESTADO-DATABASE.json` (actualizar métricas)

---

## 🚀 Comandos de Ejecución

### Fase 1: Usuarios de Prueba

```bash
# 1. Generar hash bcrypt
node -e "console.log(require('bcryptjs').hashSync('Test1234', 10))"

# 2. Crear archivo SQL con hash generado
vim /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/auth/02-test-users.sql

# 3. Ejecutar seed
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit
PGPASSWORD='[PASSWORD]' psql -h localhost -U gamilit_user -d gamilit_platform \
  -f apps/database/seeds/dev/auth/02-test-users.sql

# 4. Verificar
PGPASSWORD='[PASSWORD]' psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "SELECT email, role FROM auth.users WHERE email LIKE '%@test.gamilit.com';"
```

### Fase 2: Ejercicios Módulo 4

```bash
# 1. Crear/editar archivo
vim /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/educational_content/05-exercises-module4.sql

# 2. Agregar 6 nuevos INSERTs dentro del DO $$ block

# 3. Ejecutar seed
PGPASSWORD='[PASSWORD]' psql -h localhost -U gamilit_user -d gamilit_platform \
  -f apps/database/seeds/dev/educational_content/05-exercises-module4.sql

# 4. Verificar conteo
PGPASSWORD='[PASSWORD]' psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "SELECT m.module_code, COUNT(e.id)
      FROM educational_content.modules m
      LEFT JOIN educational_content.exercises e ON e.module_id = m.id
      WHERE m.module_code = 'MOD-04-DIGITAL'
      GROUP BY m.module_code;"
# Debe retornar: MOD-04-DIGITAL | 9
```

---

## 📝 Notas Importantes

### Dependencias Frontend

**Nuevos tipos de ejercicio requieren componentes React:**
- `hipertexto` → `<HypertextExercise />` (a implementar)
- `infografia` → `<InfographicExercise />` (a implementar)
- `busqueda_web` → `<WebSearchExercise />` (a implementar)

**Estrategia si componentes no existen:**
1. Crear seeds con `is_active = false` inicialmente
2. Implementar componentes frontend en sprint separado
3. Activar ejercicios (`is_active = true`) cuando estén listos
4. Alternativamente: Mostrar mensaje "Coming Soon" en frontend

### Testing

**Testing manual mínimo:**
1. Login con student@test.gamilit.com / Test1234
2. Navegar a Módulo 4
3. Ver lista de 9 ejercicios
4. Intentar completar 1 ejercicio nuevo
5. Verificar XP y ML Coins otorgados
6. Verificar progresión de rango si completa módulo

---

## 🔄 Próximos Pasos Después de Este Plan

1. **Re-validar 3-capas** con implementación actualizada
2. **Filtrar correcciones** del plan original (240 discrepancias)
3. **Implementar mecánicas auxiliares** (4 pendientes)
4. **Completar módulos 6-8** si se decide mantenerlos
5. **Testing de integración** completo
6. **Deployment a staging** con usuarios de prueba

---

**Generado por:** ATLAS-DATABASE v1.6
**Basado en:** REPORTE-ALINEACION-REQUERIMIENTOS.md
**Tiempo de generación:** ~30 minutos
**Estado:** ✅ LISTO PARA EJECUCIÓN
**Próximo paso:** Revisar con usuario y comenzar Fase 1
