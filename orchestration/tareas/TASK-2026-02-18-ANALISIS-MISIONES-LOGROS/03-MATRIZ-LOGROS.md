# 03-MATRIZ-LOGROS.md — Tabla de 35 Logros con Estado Funcional

**Tarea:** TASK-2026-02-18-ANALISIS-MISIONES-LOGROS
**Fecha:** 2026-02-18
**Fuentes:** `04-achievements.sql` (20 core) + `14-achievements-m3-m5.sql` (15 module-specific)

---

## Leyenda

| Columna | Descripcion |
|---------|-------------|
| BE Eval | Backend `meetsConditions()` tiene case handler |
| DB Eval | DB function `check_and_grant_achievements()` puede evaluar |
| Estado | FUNCIONAL (ambos o BE-only con mitigacion) / GAP / BUG |

---

## Core Achievements (20) — `04-achievements.sql`

| # | Nombre | Categoria | Condition Type | Condicion | BE Eval | DB Eval | XP | Coins | Rarity | Estado |
|---|--------|-----------|---------------|-----------|---------|---------|----|----|--------|--------|
| 1 | Primeros Pasos | progress | exercise_completion | 1 ejercicio completado | YES :472 | NO | 100 | 50 | common | GAP-DB |
| 2 | Lector Principiante | progress | exercise_completion | 10 ejercicios | YES :472 | NO | 150 | 100 | common | GAP-DB |
| 3 | Lector Experimentado | progress | exercise_completion | 50 ejercicios | YES :472 | NO | 250 | 150 | rare | GAP-DB |
| 4 | Lector Experto | progress | exercise_completion | 100 ejercicios | YES :472 | NO | 400 | 200 | epic | GAP-DB |
| 5 | Maestro de la Lectura | progress | exercise_completion | 200 ejercicios | YES :472 | NO | 500 | 300 | legendary | GAP-DB |
| 6 | Racha de 3 Dias | streak | streak | 3 dias consecutivos | YES :484 | NO | 100 | 75 | common | GAP-DB |
| 7 | Racha de 7 Dias | streak | streak | 7 dias consecutivos | YES :484 | NO | 250 | 150 | rare | GAP-DB |
| 8 | Racha de 30 Dias | streak | streak | 30 dias consecutivos | YES :484 | NO | 500 | 300 | epic | GAP-DB |
| 9 | Comprension Literal Dominada | completion | module_completion | Modulo 1 >= 60% | YES :497 | NO | 300 | 200 | rare | GAP-DB |
| 10 | Comprension Inferencial Dominada | completion | module_completion | Modulo 2 >= 60% | YES :497 | NO | 300 | 200 | rare | GAP-DB |
| 11 | Comprension Critica Dominada | completion | module_completion | Modulo 3 >= 60% | YES :497 | NO | 300 | 200 | rare | GAP-DB |
| 12 | Completista Total | completion | all_modules_completion | 5 modulos >= 70% avg | YES :526 | NO | 500 | 400 | legendary | GAP-DB |
| 13 | Perfeccionista | mastery | perfect_score | 10 puntuaciones perfectas | YES :546 | NO | 200 | 150 | epic | GAP-DB |
| 14 | Experto en Inferencias | mastery | skill_mastery | 20 ejercicios >= 90% (inferencial) | YES :560 | NO | 300 | 200 | epic | GAP-DB |
| 15 | Critico Avanzado | mastery | skill_mastery | 20 ejercicios >= 90% (critico) | YES :560 | NO | 300 | 200 | epic | GAP-DB |
| 16 | Explorador Curioso | exploration | exploration | 3+ modulos explorados | YES :571 | NO | 150 | 100 | common | GAP-DB |
| 17 | Aventurero del Conocimiento | exploration | exploration | Todos los niveles dificultad | YES :571 | NO | 250 | 150 | rare | GAP-DB |
| 18 | Companero de Aula | social | social | Unirse a 1 aula | YES :582 | NO | 100 | 75 | common | GAP-DB |
| 19 | Estudiante Colaborativo | social | social | 5 actividades sociales | YES :582 | NO | 200 | 150 | rare | GAP-DB |
| 20 | Primera Visita | special | special | Primer login | YES :625 | NO | 50 | 25 | common | GAP-DB |

---

## Module 3: Lectura Critica (5) — `14-achievements-m3-m5.sql`

| # | Nombre | Categoria | Condition Type | Condicion | BE Eval | DB Eval | XP | Coins | Rarity | Estado |
|---|--------|-----------|---------------|-----------|---------|---------|----|----|--------|--------|
| 21 | Pensador Critico Emergente | progress | module_first_exercise | 1er ejercicio M3 | YES :646 | NO | 150 | 100 | common | GAP-DB |
| 22 | Juez de Opiniones | mastery | exercise_score | Tribunal >= 90% | YES :668 | NO | 200 | 150 | rare | GAP-DB |
| 23 | Maestro del Debate | mastery | exercise_score | Debate Digital >= 95% | YES :668 | NO | 250 | 200 | epic | GAP-DB |
| 24 | Verificador de Fuentes | mastery | exercise_score | CRAAP Analysis = 100% | YES :668 | NO | 300 | 250 | epic | GAP-DB |
| 25 | Comprension Critica Dominada | completion | module_completion | M3 todos >= 60% | YES :497 | NO | 400 | 300 | legendary | GAP-DB |

---

## Module 4: Alfabetizacion Digital (5) — `14-achievements-m3-m5.sql`

| # | Nombre | Categoria | Condition Type | Condicion | BE Eval | DB Eval | XP | Coins | Rarity | Estado |
|---|--------|-----------|---------------|-----------|---------|---------|----|----|--------|--------|
| 26 | Detective de la Verdad | mastery | exercise_repetition | Fake News x5 exitoso | YES :689 | NO | 200 | 150 | rare | GAP-DB |
| 27 | Explorador Digital | progress | exercise_repetition | Infographic x3 | YES :689 | NO | 150 | 100 | common | GAP-DB |
| 28 | Velocista Digital | mastery | exercise_speed | QuizTikTok <30s 100% | YES :711 | NO | 250 | 200 | epic | GAP-DB |
| 29 | Memelogo | mastery | content_analysis | Analizar 10 memes | YES :734 | NO | 200 | 150 | rare | GAP-DB |
| 30 | Maestro Alfabetizacion Digital | completion | module_completion | M4 todos >= 60% | YES :497 | NO | 400 | 300 | legendary | GAP-DB |

---

## Module 5: Produccion Creativa (5) — `14-achievements-m3-m5.sql`

| # | Nombre | Categoria | Condition Type | Condicion | BE Eval | DB Eval | XP | Coins | Rarity | Estado |
|---|--------|-----------|---------------|-----------|---------|---------|----|----|--------|--------|
| 31 | Escritor Creativo | mastery | exercise_score | Multimedia Diary >= 80% | YES :668 | NO | 200 | 150 | rare | GAP-DB |
| 32 | Artista Narrativo | mastery | exercise_score | Digital Comic >= 80% | YES :668 | NO | 200 | 150 | rare | GAP-DB |
| 33 | Voz del Pasado | mastery | exercise_score | Video-Carta >= 80% | YES :668 | NO | 200 | 150 | rare | GAP-DB |
| 34 | Produccion Completa | completion | module_completion | M5 todos >= 60% | YES :497 | NO | 400 | 300 | legendary | GAP-DB |
| 35 | Creador Multimedia Experto | mastery | module_average_score | M5 avg >= 90% | YES :756 | NO | 500 | 400 | legendary | GAP-DB |

---

## Resumen de Condition Types (14 unicos)

| Condition Type | Count | Backend Line | DB Function | Estado |
|---------------|-------|-------------|-------------|--------|
| exercise_completion | 5 | :472 | NO match | BE-only |
| streak | 3 | :484 | NO match | BE-only |
| module_completion | 7 | :497 | NO match | BE-only |
| all_modules_completion | 1 | :526 | NO match | BE-only |
| perfect_score | 1 | :546 | NO match | BE-only |
| skill_mastery | 2 | :560 | NO match | BE-only |
| exploration | 2 | :571 | NO match | BE-only |
| social | 2 | :582 | NO match | BE-only |
| special | 1 | :625 | NO match | BE-only |
| module_first_exercise | 1 | :646 | NO match | BE-only |
| exercise_score | 4 | :668 | NO match | BE-only |
| exercise_repetition | 2 | :689 | NO match | BE-only |
| exercise_speed | 1 | :711 | NO match | BE-only |
| content_analysis | 1 | :734 | NO match | BE-only |
| module_average_score | 1 | :756 | NO match | BE-only |

**Total:** 35/35 evaluables via backend, 0/35 evaluables via DB function

---

## Distribucion por Categoria

| Categoria | Count | Logros |
|-----------|-------|--------|
| progress | 9 | #1-5, #21, #27, #20, #16 |
| streak | 3 | #6-8 |
| completion | 7 | #9-12, #25, #30, #34 |
| mastery | 11 | #13-15, #22-24, #26, #28-29, #31-33, #35 |
| exploration | 2 | #16-17 |
| social | 2 | #18-19 |
| special | 1 | #20 |
| **collection** | **0** | **(vacia — TECH-DEBT)** |

## Distribucion por Rarity

| Rarity | Count |
|--------|-------|
| common | 9 |
| rare | 12 |
| epic | 8 |
| legendary | 6 |

## Totales de Recompensas

| Metrica | Valor |
|---------|-------|
| XP total posible | 8,750 |
| ML Coins total posible | 6,075 |
| XP promedio por logro | 250 |
| ML Coins promedio | 173 |
| Min XP | 50 (Primera Visita) |
| Max XP | 500 (Maestro Lectura, Completista Total, Creador Multimedia) |
| Min Coins | 25 (Primera Visita) |
| Max Coins | 400 (Completista Total, Creador Multimedia) |
