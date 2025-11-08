# Datos Seed (Iniciales y de Prueba) - GAMILIT Platform

**Épica:** EMR-001 - Migración y Robustecimiento de BD
**Fecha:** 2025-11-02
**Origen:** `/docs/03-desarrollo/base-de-datos/DATOS-SEED.md`

---

## Resumen Ejecutivo

- **Archivos de Seed:** 9 archivos principales
- **Achievements:** 30+ logros predefinidos
- **Módulos Educativos:** 5 módulos de Marie Curie
- **Ejercicios:** 50+ ejercicios (27 tipos)
- **Usuarios Demo:** 10+ usuarios de prueba
- **Configuración del Sistema:** 20+ settings

---

## 1. Estrategia de Datos Seed

### 1.1 Tipos de Datos

#### Production Seed (Siempre en producción)
- Achievements base
- Configuración del sistema
- Módulos educativos de Marie Curie
- Ejercicios estándar

#### Development Seed (Solo dev/staging)
- Usuarios demo
- Datos de prueba
- Progreso de usuarios simulados

---

## 2. Orden de Ejecución

```bash
# 1. Achievements (SIEMPRE PRIMERO)
psql -f seed_data/01_achievements_seed.sql

# 2. Configuración del Sistema
psql -f seed_data/02_system_config_seed.sql

# 3. Módulos Educativos
psql -f seed_data/03_educational_modules_seed.sql

# 4. Datos de Demo (OPCIONAL - solo dev/staging)
psql -f seed_data/04_demo_users_and_data_seed.sql

# 5. Content Enhancements (OPCIONAL)
psql -f seed_data/05_enhanced_crossword.sql
psql -f seed_data/06_enhanced_timeline_update.sql
psql -f seed_data/07_enhanced_wordsearch_update.sql
psql -f seed_data/08_module1_marie_curie_exercises_update.sql
psql -f seed_data/09_module1_update_simple.sql
psql -f seed_data/09_enrich_exercises_questions.sql
```

---

## 3. Archivo 01: Achievements Seed

**Archivo:** `01_achievements_seed.sql`
**Total:** ~30 achievements

### 3.1 Categorías

#### Progress (Progreso) - 8 achievements
- Primer Paso (1 ejercicio) - 10 ML Coins
- Aprendiz Dedicado (10 ejercicios) - 50 ML Coins
- Estudiante Comprometido (50 ejercicios) - 100 ML Coins
- Maestro del Conocimiento (100 ejercicios) - 200 ML Coins

#### Streak (Rachas) - 5 achievements
- Racha de Fuego (3 días) - 25 ML Coins
- Semana de Dedicación (7 días) - 75 ML Coins
- Mes Imparable (30 días) - 300 ML Coins

#### Completion (Completación) - 6 achievements
- Primer Módulo Completo - 100 ML Coins
- Perfeccionista (100% precisión) - 200 ML Coins

#### Social (Interacción Social) - 4 achievements
- Buen Compañero (primer amigo) - 20 ML Coins
- Líder del Equipo (crear equipo) - 50 ML Coins

#### Special (Especiales) - 3 achievements
- Madrugador (antes 6:00 AM) - 75 ML Coins
- Noctámbulo Estudioso (después 10:00 PM) - 75 ML Coins

#### Mastery (Maestría) - 4 achievements
- Experto en Marie Curie (5 módulos, 90% avg) - 500 ML Coins

### 3.2 Estructura JSONB

**Conditions:**
```json
{
    "type": "progress | streak | completion | social | special | mastery",
    "requirements": {
        "exercises_completed": 10,
        "days": 7,
        "average_score": 90,
        "topic": "marie_curie"
    }
}
```

**Rewards:**
```json
{
    "ml_coins": 50,
    "xp": 100,
    "badge": "achievement_badge_id",
    "certificate": true,
    "special_item": "avatar_frame_gold"
}
```

---

## 4. Archivo 02: System Config Seed

**Archivo:** `02_system_config_seed.sql`

### 4.1 Categorías de Settings

#### General
- `platform_name`: "GAMILIT - Gamified Learning Interactive Toolkit"
- `default_timezone`: "America/Mexico_City"
- `default_language`: "es"

#### Gamification
- `ml_coins_welcome_bonus`: 100
- `comodin_pistas_cost`: 15
- `comodin_vision_lectora_cost`: 25
- `comodin_segunda_oportunidad_cost`: 40
- `daily_streak_bonus`: 25

#### Security
- `max_login_attempts`: 5
- `session_timeout_minutes`: 480 (8 horas)
- `password_min_length`: 8

#### Email
- `smtp_host`: "smtp.example.com"
- `from_email`: "noreply@glit.edu.mx"

### 4.2 Feature Flags Iniciales

- `missions_system`: Enabled, 100%
- `global_leaderboards`: Enabled, 100%
- `collaborative_teams`: Enabled, 100%
- `live_chat`: Disabled, 0%
- `competitive_mode`: A/B testing, 10%

---

## 5. Archivo 03: Educational Modules Seed

**Archivo:** `03_educational_modules_seed.sql`

### 5.1 Módulo 1: Biografía de Marie Curie
- **Difficulty:** beginner
- **Duración:** 120 min
- **Rango otorgado:** batab
- **Recompensas:** 100 XP, 50 ML Coins
- **Ejercicios:** 10-15 (multiple choice, timeline, matching, crossword)

**Timeline:**
- 1867: Nace en Varsovia, Polonia
- 1891: Se muda a París (Sorbona)
- 1895: Se casa con Pierre Curie
- 1903: Gana su primer Premio Nobel (Física)

### 5.2 Módulo 2: Descubrimientos Científicos
- **Difficulty:** intermediate
- **Rango requerido:** batab
- **Rango otorgado:** holcatte
- **Recompensas:** 200 XP, 100 ML Coins
- **Ejercicios:** 12-18 (interactive diagram, simulation, video, data analysis)

### 5.3 Módulo 3: Premios Nobel
- **Difficulty:** intermediate
- **Rango requerido:** holcatte
- **Rango otorgado:** guerrero

### 5.4 Módulo 4: Mujeres en la Ciencia
- **Difficulty:** advanced
- **Rango requerido:** guerrero

### 5.5 Módulo 5: Física Moderna
- **Difficulty:** advanced
- **Rango requerido:** guerrero
- **Rango otorgado:** mercenario

---

## 6. Archivo 04: Demo Users and Data Seed

**Archivo:** `04_demo_users_and_data_seed.sql`

### 6.1 Tenant Demo
- **Nombre:** Escuela Demo GAMILIT
- **Slug:** escuela-demo
- **Tier:** professional

### 6.2 Usuarios Demo

#### Estudiante 1
- **Email:** estudiante1@demo.glit.edu.mx
- **Nombre:** Ana María García López
- **Grado:** 7
- **Progreso:** Módulo 1 completado (100%)

#### Profesor 1
- **Email:** profesor1@demo.glit.edu.mx
- **Nombre:** Prof. Carlos Ramírez
- **Role:** admin_teacher

#### Super Admin
- **Email:** admin@demo.glit.edu.mx
- **Nombre:** Admin GAMILIT
- **Role:** super_admin

### 6.3 Escuela y Aula Demo

**Escuela:** Secundaria Benito Juárez
- **Código:** SBJ001
- **Ciudad:** Ciudad de México

**Aula:** Grupo 7-A
- **Código:** CLASE-7A
- **Grado:** 7
- **Profesor:** Prof. Carlos Ramírez

---

## 7. Archivos 05-09: Content Enhancements

### 7.1 Enhanced Crossword (05)
- Crucigramas mejorados con vocabulario científico

### 7.2 Enhanced Timeline (06)
- Timeline interactiva con eventos históricos

### 7.3 Enhanced Wordsearch (07)
- Sopas de letras con vocabulario

### 7.4 Module 1 Exercises Update (08)
- Actualización completa de ejercicios del módulo 1

### 7.5 Module 1 Simple Update (09)
- Simplificación de algunos ejercicios

### 7.6 Enrich Exercises Questions (09b)
- Enriquecimiento de preguntas con explicaciones

---

## 8. Estrategia de Aplicación

### Producción (Solo datos esenciales)
```bash
psql -f seed_data/01_achievements_seed.sql
psql -f seed_data/02_system_config_seed.sql
psql -f seed_data/03_educational_modules_seed.sql
```

### Staging (Datos esenciales + enhancements)
```bash
psql -f seed_data/01_achievements_seed.sql
psql -f seed_data/02_system_config_seed.sql
psql -f seed_data/03_educational_modules_seed.sql
psql -f seed_data/05_enhanced_crossword.sql
psql -f seed_data/06_enhanced_timeline_update.sql
psql -f seed_data/07_enhanced_wordsearch_update.sql
```

### Desarrollo (TODO: datos de prueba)
```bash
psql -f seed_final.sql  # All-in-one
```

---

## 9. Validación Post-Seed

```sql
-- 1. Verificar achievements
SELECT category, COUNT(*) FROM gamification_system.achievements
GROUP BY category;
-- Esperado: progress(8), streak(5), completion(6), social(4), special(3), mastery(4)

-- 2. Verificar módulos
SELECT order_index, title, is_published
FROM educational_content.modules
ORDER BY order_index;
-- Esperado: 5 módulos

-- 3. Verificar ejercicios por módulo
SELECT m.title, COUNT(e.id) as ejercicios
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON m.id = e.module_id
GROUP BY m.id, m.title
ORDER BY m.order_index;
-- Esperado: 10-18 ejercicios por módulo

-- 4. Verificar settings
SELECT setting_category, COUNT(*)
FROM system_configuration.system_settings
GROUP BY setting_category;

-- 5. Verificar usuarios demo (solo dev)
SELECT role, COUNT(*)
FROM auth_management.profiles
WHERE email LIKE '%@demo.glit.edu.mx'
GROUP BY role;
```

---

## 10. Question Bank (Bancos de Preguntas)

**Ubicación:** `/database/question_bank/`

### 10.1 Module 01 - Literal

#### marie_biography_complete.json
- **Total:** 50+ preguntas
- **Difficulty:** beginner
- **Topics:** Biografía, fechas clave, contexto histórico

**Estructura:**
```json
{
    "module": "module_01_literal",
    "topic": "marie_biography",
    "questions": [
        {
            "id": "bio-001",
            "type": "multiple_choice",
            "question": "¿En qué año nació Marie Curie?",
            "options": ["1865", "1867", "1870", "1872"],
            "correct_answer": "1867",
            "explanation": "Marie Curie nació el 7 de noviembre de 1867 en Varsovia, Polonia.",
            "ml_coins_reward": 5,
            "xp_reward": 10
        }
    ]
}
```

#### marie_discoveries_complete.json
- **Total:** 50+ preguntas
- **Topics:** Descubrimientos científicos, radio, polonio, radiactividad

---

## 11. Referencias

- **Esquema:** `tareas/03-documentacion/ESQUEMA-44-TABLAS.md`
- **Migraciones:** `tareas/01-migraciones/MIGRACIONES-HISTORICO.md`
- **Seed Scripts:** `/docs/03-desarrollo/base-de-datos/seed_data/`

---

**Última actualización:** 2025-11-02
**Consolidado por:** ARTEMIS (Agente de Migración)
