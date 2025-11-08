# RF-EDU-002: Niveles de Dificultad de Ejercicios

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-EDU-002 |
| **Módulo** | 03 - Contenido Educativo |
| **Título** | Niveles de Dificultad y Progresión Adaptativa |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Pedagogical Team |
| **Stakeholders** | Product Owner, Content Team, Teachers, Students |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:50-58`
- **Tipo:** `educational_content.difficulty_level`
- **Valores:** `beginner`, `elementary`, `pre_intermediate`, `intermediate`, `upper_intermediate`, `advanced`, `proficient`, `native`

🗄️ **Tablas Relacionadas:**
1. **`educational_content.exercises`**
   - **Columna:** `difficulty` (ENUM difficulty_level)
   - **Propósito:** Nivel de dificultad del ejercicio

2. **`educational_content.difficulty_parameters`**
   - **Ubicación:** `apps/database/ddl/schemas/educational_content/tables/difficulty_parameters.sql:1-35`
   - **Propósito:** Parámetros que definen cada nivel de dificultad
   - **Columnas clave:**
     - `difficulty_level` (ENUM)
     - `vocabulary_complexity` (1-10)
     - `grammar_complexity` (1-10)
     - `sentence_length_avg` (palabras)
     - `time_limit_multiplier` (FLOAT)

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-EDU-002: Implementación de Niveles de Dificultad](../../02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-002-niveles-dificultad.md)

### Documentos Relacionados

- [RF-EDU-001: Mecánicas de Ejercicios](./RF-EDU-001-mecanicas-ejercicios.md) - Ejercicios con dificultad variable
- [RF-EDU-003: Taxonomía de Bloom](./RF-EDU-003-taxonomia-bloom.md) - Complejidad cognitiva
- [RF-GAM-001: Sistema de XP](../02-gamificacion/RF-GAM-001-achievements.md) - XP por dificultad
- [RF-PRG-001: Estados de Progreso](../04-progreso-seguimiento/RF-PRG-001-estados-progreso.md) - Desbloqueo progresivo
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-3-contenido-educativo)

---

## 📖 Descripción General

### Propósito

El **Sistema de Niveles de Dificultad** clasifica los ejercicios en **8 niveles progresivos** que van desde principiante absoluto hasta nivel nativo. Este sistema:

- Proporciona **progresión pedagógica** clara
- Adapta **recompensas** según dificultad (XP, ML Coins)
- Personaliza **tiempo límite** por nivel
- Guía el **desbloqueo secuencial** de contenido
- Genera **estadísticas** de desempeño por nivel

### Marco Conceptual

Los niveles siguen el **Marco Común Europeo de Referencia (CEFR)** adaptado al contexto de lengua maya:

```
Principiante → Elemental → Pre-intermedio → Intermedio → Intermedio Alto → Avanzado → Proficiente → Nativo
    A1           A2             B1              B2               C1               C2          C2+         Nativo
```

---

## ⚙️ Los 8 Niveles de Dificultad

### 1. Beginner (Principiante) - A1

**Perfil del Estudiante:**
- Primer contacto con el idioma maya
- Sin conocimientos previos
- Edad: 6-8 años o adultos principiantes

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 10-50 palabras conocidas |
| **Gramática** | Solo presente simple, estructuras básicas |
| **Longitud de Oraciones** | 3-5 palabras |
| **Complejidad Cognitiva** | Recordar, Reconocer (Bloom nivel 1) |
| **Tiempo Límite** | 3x el tiempo base |
| **Hints Disponibles** | 3 pistas |
| **Recompensa XP** | 10 XP por ejercicio correcto |

**Ejemplos de Ejercicios:**
- Emparejar imagen con palabra maya
- Seleccionar traducción correcta de saludos básicos
- Escuchar palabra y seleccionar imagen correcta
- Completar palabra faltante en oración simple

**Vocabulario Típico:**
- Saludos: *Ba'ax ka wa'alik* (¿Cómo estás?), *Maalo'ob* (Bien)
- Números: *jump'éel* (uno), *ka'a* (dos)
- Familia: *nah* (mamá), *taat* (papá)
- Colores básicos

---

### 2. Elementary (Elemental) - A2

**Perfil del Estudiante:**
- 2-3 meses de estudio
- Puede formar oraciones muy simples
- Edad: 7-10 años o adultos con 30+ horas de estudio

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 50-150 palabras |
| **Gramática** | Presente, pasado simple, plurales básicos |
| **Longitud de Oraciones** | 5-8 palabras |
| **Complejidad Cognitiva** | Comprender (Bloom nivel 2) |
| **Tiempo Límite** | 2.5x el tiempo base |
| **Hints Disponibles** | 2 pistas |
| **Recompensa XP** | 15 XP por ejercicio correcto |

**Ejemplos de Ejercicios:**
- Ordenar palabras para formar oración
- Conjugar verbos simples en presente
- Responder preguntas básicas sobre texto corto
- Escribir oración usando vocabulario dado

---

### 3. Pre-Intermediate (Pre-Intermedio) - B1

**Perfil del Estudiante:**
- 4-6 meses de estudio
- Puede mantener conversaciones simples
- Edad: 9-12 años o adultos con 60+ horas

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 150-400 palabras |
| **Gramática** | Todos los tiempos básicos, condicional simple |
| **Longitud de Oraciones** | 8-12 palabras |
| **Complejidad Cognitiva** | Aplicar (Bloom nivel 3) |
| **Tiempo Límite** | 2x el tiempo base |
| **Hints Disponibles** | 1 pista |
| **Recompensa XP** | 20 XP |

**Ejemplos de Ejercicios:**
- Completar diálogo con expresiones apropiadas
- Identificar error gramatical en oración
- Escribir párrafo corto sobre tema familiar
- Responder preguntas de comprensión sobre texto narrativo

---

### 4. Intermediate (Intermedio) - B2

**Perfil del Estudiante:**
- 7-12 meses de estudio
- Puede expresar opiniones con cierta fluidez
- Edad: 11-14 años o adultos con 100+ horas

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 400-800 palabras |
| **Gramática** | Subjuntivo, condicional compuesto |
| **Longitud de Oraciones** | 12-18 palabras |
| **Complejidad Cognitiva** | Analizar (Bloom nivel 4) |
| **Tiempo Límite** | 1.5x el tiempo base |
| **Hints Disponibles** | 0 pistas |
| **Recompensa XP** | 30 XP |

**Ejemplos de Ejercicios:**
- Analizar diferencias sutiles entre sinónimos
- Escribir texto argumentativo breve
- Comprensión de audio con acentos regionales
- Identificar uso correcto de tiempos verbales en contexto

---

### 5. Upper Intermediate (Intermedio Alto) - C1

**Perfil del Estudiante:**
- 1-2 años de estudio
- Puede participar en discusiones complejas
- Edad: 13-16 años o adultos con 200+ horas

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 800-1500 palabras |
| **Gramática** | Estructuras avanzadas, modismos |
| **Longitud de Oraciones** | 18-25 palabras |
| **Complejidad Cognitiva** | Evaluar (Bloom nivel 5) |
| **Tiempo Límite** | 1.25x el tiempo base |
| **Hints Disponibles** | 0 pistas |
| **Recompensa XP** | 40 XP |

**Ejemplos de Ejercicios:**
- Evaluar calidad argumentativa de texto
- Producir texto formal (carta, ensayo)
- Comprender literatura maya clásica simplificada
- Identificar registro lingüístico apropiado (formal/informal)

---

### 6. Advanced (Avanzado) - C2

**Perfil del Estudiante:**
- 2-4 años de estudio intensivo
- Dominio cercano al nativo en contextos académicos
- Edad: Adultos con 400+ horas

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 1500-3000 palabras |
| **Gramática** | Todos los aspectos gramaticales |
| **Longitud de Oraciones** | 25-40 palabras |
| **Complejidad Cognitiva** | Crear (Bloom nivel 6) |
| **Tiempo Límite** | 1x el tiempo base |
| **Hints Disponibles** | 0 pistas |
| **Recompensa XP** | 50 XP |

**Ejemplos de Ejercicios:**
- Análisis lingüístico de texto literario
- Producción de ensayo académico
- Traducción bidireccional (maya ↔ español)
- Análisis de variantes dialectales

---

### 7. Proficient (Proficiente) - C2+

**Perfil del Estudiante:**
- 4+ años de estudio + inmersión
- Dominio nativo académico
- Maestros, lingüistas, traductores

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | 3000+ palabras + arcaísmos |
| **Gramática** | Todas las estructuras + arcaísmos |
| **Longitud de Oraciones** | Ilimitada |
| **Complejidad Cognitiva** | Investigar, Innovar |
| **Tiempo Límite** | 1x el tiempo base |
| **Hints Disponibles** | 0 pistas |
| **Recompensa XP** | 70 XP |

**Ejemplos de Ejercicios:**
- Análisis paleográfico de textos coloniales
- Investigación etimológica
- Producción de contenido didáctico
- Análisis comparativo dialectal profundo

---

### 8. Native (Nativo)

**Perfil del Estudiante:**
- Hablante nativo del maya yucateco
- Creció hablando maya en casa/comunidad
- Objetivo: Alfabetización en lengua materna

**Características de Ejercicios:**

| Aspecto | Parámetros |
|---------|------------|
| **Vocabulario** | Vocabulario nativo completo |
| **Gramática** | Estructuras nativas complejas |
| **Longitud de Oraciones** | Ilimitada |
| **Complejidad Cognitiva** | Meta-lingüística |
| **Tiempo Límite** | 0.8x el tiempo base |
| **Hints Disponibles** | 0 pistas |
| **Recompensa XP** | 100 XP |

**Ejemplos de Ejercicios:**
- Ortografía estandarizada (muchos nativos no escriben)
- Análisis de variación generacional
- Preservación y documentación de vocabulario local
- Producción de contenido para revitalización

---

## 🎯 Criterios de Dificultad por Aspecto

### Complejidad de Vocabulario

| Nivel | Palabras Conocidas | Tipo de Vocabulario |
|-------|-------------------|---------------------|
| Beginner | 10-50 | Concreto, cotidiano |
| Elementary | 50-150 | Concreto + abstracto básico |
| Pre-Intermediate | 150-400 | Abstracto, sentimientos |
| Intermediate | 400-800 | Académico básico |
| Upper Intermediate | 800-1500 | Académico, técnico |
| Advanced | 1500-3000 | Literario, especializado |
| Proficient | 3000+ | Arcaico, variantes |
| Native | Nativo | Coloquialismos, regionalismos |

### Complejidad Gramatical

| Nivel | Estructuras Gramaticales |
|-------|-------------------------|
| Beginner | Presente simple, SVO básico |
| Elementary | Presente, pasado simple, plurales |
| Pre-Intermediate | Todos los tiempos básicos, condicional |
| Intermediate | Subjuntivo, condicional compuesto |
| Upper Intermediate | Voz pasiva, perífrasis verbales |
| Advanced | Todas las estructuras estándar |
| Proficient | Estructuras arcaicas, formales |
| Native | Idiolecto nativo completo |

### Longitud de Texto

| Nivel | Palabras por Oración | Oraciones por Párrafo | Párrafos por Ejercicio |
|-------|---------------------|----------------------|------------------------|
| Beginner | 3-5 | 1-2 | 1 |
| Elementary | 5-8 | 2-3 | 1-2 |
| Pre-Intermediate | 8-12 | 3-4 | 2-3 |
| Intermediate | 12-18 | 4-6 | 3-5 |
| Upper Intermediate | 18-25 | 6-8 | 5-7 |
| Advanced | 25-40 | 8-12 | 7-10 |
| Proficient | 30-50 | 10-15 | 10+ |
| Native | Sin límite | Sin límite | Sin límite |

---

## 💰 Recompensas por Dificultad

### XP por Ejercicio

```typescript
const XP_BY_DIFFICULTY = {
  beginner: 10,
  elementary: 15,
  pre_intermediate: 20,
  intermediate: 30,
  upper_intermediate: 40,
  advanced: 50,
  proficient: 70,
  native: 100
};
```

### ML Coins por Ejercicio

```typescript
const ML_COINS_BY_DIFFICULTY = {
  beginner: 2,
  elementary: 3,
  pre_intermediate: 5,
  intermediate: 7,
  upper_intermediate: 10,
  advanced: 15,
  proficient: 20,
  native: 30
};
```

### Multiplicador por Primer Intento

Si el usuario acierta al **primer intento**, recibe **1.5x** las recompensas:

```
XP de ejercicio intermediate (30) × 1.5 = 45 XP
ML Coins de intermediate (7) × 1.5 = 10 ML Coins (redondeado)
```

---

## 🔓 Desbloqueo Progresivo

### Regla de Desbloqueo

**Los estudiantes solo pueden acceder a ejercicios de su nivel o 1 nivel superior:**

```
Nivel Actual del Estudiante: Intermediate (B2)
  ✅ Puede hacer: Beginner, Elementary, Pre-Intermediate, Intermediate, Upper Intermediate
  ❌ NO puede hacer: Advanced, Proficient, Native
```

### Criterios de Promoción de Nivel

**Para avanzar al siguiente nivel de dificultad, el estudiante debe:**

| Criterio | Requisito |
|----------|-----------|
| **Tasa de Éxito** | ≥80% en ejercicios del nivel actual |
| **Ejercicios Completados** | ≥30 ejercicios del nivel actual |
| **Tiempo Promedio** | ≤1.5x el tiempo promedio del nivel |

**Ejemplo:**
```
Estudiante en nivel Pre-Intermediate:
- Tasa de éxito: 85% ✅
- Ejercicios completados: 42 ✅
- Tiempo promedio: 1.3x ✅
→ PROMOCIÓN a Intermediate
```

### Excepciones

**Maestros pueden:**
- Asignar ejercicios de cualquier nivel a sus estudiantes (override automático)
- Ajustar manualmente el nivel de un estudiante

**Placement Test:**
- Al registrarse, estudiante hace "placement test"
- Sistema determina nivel inicial automáticamente
- Puede empezar en cualquier nivel (no necesariamente Beginner)

---

## ⏱️ Tiempo Límite por Dificultad

### Multiplicador de Tiempo

Cada nivel tiene un **multiplicador de tiempo base** que se aplica según la mecánica:

| Nivel | Multiplicador | Ejemplo (Base 60s) |
|-------|--------------|-------------------|
| Beginner | 3.0x | 180 segundos |
| Elementary | 2.5x | 150 segundos |
| Pre-Intermediate | 2.0x | 120 segundos |
| Intermediate | 1.5x | 90 segundos |
| Upper Intermediate | 1.25x | 75 segundos |
| Advanced | 1.0x | 60 segundos |
| Proficient | 1.0x | 60 segundos |
| Native | 0.8x | 48 segundos (nativos son más rápidos) |

**Cálculo:**
```typescript
const finalTimeLimit = baseTimeForMechanic * difficultyMultiplier;

// Ejemplo:
// Mecánica: Multiple Choice (base 60s)
// Dificultad: Beginner (3.0x)
// Tiempo final: 60s × 3.0 = 180s
```

---

## 💼 Casos de Uso

### CU-EDU-002-01: Estudiante Realiza Placement Test

**Actor:** Estudiante nuevo

**Precondiciones:**
- Estudiante registrado
- Primer acceso al sistema

**Flujo Principal:**
1. Sistema detecta que es primera vez del estudiante
2. Sistema presenta "Placement Test":
   - 10 ejercicios de dificultad mixta (Beginner a Intermediate)
   - Sin tiempo límite
   - Sin penalización por fallar
3. Estudiante completa los 10 ejercicios
4. Sistema evalúa resultados:
   ```
   Resultados:
   - Beginner: 100% (3/3 correctos)
   - Elementary: 100% (3/3 correctos)
   - Pre-Intermediate: 67% (2/3 correctos)
   - Intermediate: 0% (0/1 correcto)
   ```
5. Sistema asigna nivel: **Pre-Intermediate**
6. Estudiante puede acceder a ejercicios: Beginner → Intermediate (1 nivel arriba)

**Resultado:**
- Nivel inicial asignado
- Estudiante puede empezar aprendizaje en nivel apropiado

---

### CU-EDU-002-02: Sistema Promociona Estudiante de Nivel

**Actor:** Sistema (automatizado)

**Trigger:** Estudiante completa ejercicio

**Flujo Principal:**
1. Estudiante completa ejercicio de nivel Pre-Intermediate (correcto)
2. Sistema actualiza estadísticas:
   ```sql
   UPDATE educational_content.user_difficulty_stats
   SET
     exercises_completed = exercises_completed + 1,
     exercises_correct = exercises_correct + 1,
     success_rate = (exercises_correct::FLOAT / exercises_completed) * 100
   WHERE user_id = 'uuid' AND difficulty = 'pre_intermediate';
   ```
3. Sistema verifica criterios de promoción:
   ```
   Pre-Intermediate Stats:
   - Tasa de éxito: 82% ✅ (>= 80%)
   - Ejercicios completados: 35 ✅ (>= 30)
   - Tiempo promedio: 1.4x ✅ (<= 1.5x)
   ```
4. Criterios cumplidos → **PROMOCIÓN**
5. Sistema:
   - Actualiza `user_profile.current_difficulty_level = 'intermediate'`
   - Crea notificación: "🎉 ¡Subiste de nivel! Ahora eres Intermediate"
   - Otorga achievement: "Level Up: Intermediate"
   - Otorga bonus: 50 XP + 10 ML Coins
6. Estudiante ahora puede acceder hasta nivel Upper Intermediate

**Resultado:**
- Estudiante promocionado
- Acceso a ejercicios más difíciles
- Recompensa por logro

---

## 📊 Analytics por Nivel de Dificultad

### Métricas del Sistema

**Por Estudiante:**
```sql
SELECT
  difficulty,
  COUNT(*) AS total_attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_attempts,
  ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 2) AS success_rate,
  AVG(time_spent_seconds) AS avg_time
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON ea.exercise_id = e.id
WHERE ea.user_id = 'uuid'
GROUP BY difficulty
ORDER BY difficulty;
```

**Global (Admin Dashboard):**
- Distribución de estudiantes por nivel
- Tasa de promoción por nivel
- Niveles más difíciles (mayor tasa de abandono)
- Tiempo promedio de permanencia en cada nivel

---

## ✅ Criterios de Aceptación

### Para Estudiantes
- [ ] Puede realizar placement test al inicio
- [ ] Solo ve ejercicios de su nivel o 1 nivel superior
- [ ] Recibe notificación al ser promocionado de nivel
- [ ] Ve sus estadísticas por nivel en dashboard
- [ ] Entiende por qué no puede acceder a ejercicios de niveles muy altos

### Para Maestros
- [ ] Puede asignar ejercicios de cualquier nivel (override)
- [ ] Puede ajustar manualmente el nivel de un estudiante
- [ ] Ve distribución de estudiantes por nivel en su clase
- [ ] Identifica estudiantes estancados en un nivel

### Para Sistema
- [ ] Asigna nivel inicial basado en placement test
- [ ] Promociona automáticamente según criterios
- [ ] Calcula recompensas correctas según nivel
- [ ] Aplica tiempo límite apropiado por nivel
- [ ] Previene acceso a ejercicios fuera de rango permitido

---

## 🔒 Consideraciones Pedagógicas

### Principio de Zona de Desarrollo Próximo (Vygotsky)

El sistema permite acceso a **1 nivel superior** para mantener al estudiante en su "zona de desarrollo próximo" - desafío suficiente sin ser abrumador.

### Prevención de Frustración

- **Beginner → Elementary:** Transición gradual, 80% de éxito requerido
- **No saltos de nivel:** Sistema nunca salta niveles automáticamente
- **Regresión permitida:** Estudiante puede hacer ejercicios de niveles más bajos para reforzar

### Motivación Intrínseca

- Recompensas aumentan significativamente con nivel (10 XP → 100 XP)
- Promoción de nivel es celebrada con notificación y achievement
- Progreso visible en dashboard personal

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación inicial del documento |

---

**Documento:** `docs/01-requerimientos/03-contenido-educativo/RF-EDU-002-niveles-dificultad.md`
**Propósito:** Definir 8 niveles de dificultad progresivos y sistema de promoción adaptativa
