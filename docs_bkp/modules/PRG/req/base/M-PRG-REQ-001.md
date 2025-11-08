
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-PRG-001 -->
<!-- ID Nuevo: M-PRG-REQ-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-PRG-REQ-001: Estados de Progreso y Tracking

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-PRG-001 |
| **Módulo** | 04 - Progreso y Seguimiento |
| **Título** | Estados de Progreso y Tracking |
| **Prioridad** | Crítica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Product Team |
| **Stakeholders** | Product Owner, Backend Team, Analytics Team |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUMs Canónicos:**
- **`progress_tracking.progress_status`** - `apps/database/ddl/00-prerequisites.sql:66-70`
  - Valores: `not_started`, `in_progress`, `completed`, `mastered`

- **`progress_tracking.attempt_status`** - `apps/database/ddl/00-prerequisites.sql:71-75`
  - Valores: `started`, `in_progress`, `submitted`, `evaluated`, `discounted`

🗄️ **Tablas Relacionadas:**
1. **`progress_tracking.module_progress`**
   - **Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/module_progress.sql`
   - **Propósito:** Progreso del usuario en cada módulo
   - **Columnas clave:**
     - `user_id`, `module_id`
     - `status` (ENUM progress_status)
     - `completion_percentage` (0-100)
     - `exercises_completed`, `exercises_total`

2. **`progress_tracking.lesson_progress`**
   - **Propósito:** Progreso en lecciones individuales
   - **Columnas clave:**
     - `user_id`, `lesson_id`
     - `status`, `completion_percentage`

3. **`progress_tracking.exercise_attempts`**
   - **Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/exercise_attempts.sql`
   - **Propósito:** Cada intento de ejercicio
   - **Columnas clave:**
     - `user_id`, `exercise_id`
     - `attempt_number` (1, 2, 3...)
     - `status` (ENUM attempt_status)
     - `score` (0-100)
     - `time_spent_seconds`
     - `is_correct` (BOOLEAN)

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-PRG-001: Implementación de Tracking de Progreso](../../02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-001-estados-progreso.md)

### Documentos Relacionados

- [RF-EDU-001: Mecánicas de Ejercicios](../03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md) - Ejercicios que se completan
- [RF-GAM-001: Sistema de Achievements](../02-gamificacion/RF-GAM-001-achievements.md) - Achievements por completar contenido
- [RF-GAM-002: Sistema de Comodines](../02-gamificacion/RF-GAM-002-comodines.md) - Comodines en intentos
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-4-progreso-y-seguimiento)

---

## 📖 Descripción General

### Propósito

El **Sistema de Tracking de Progreso** registra y gestiona el avance de los estudiantes a través de:

- **Módulos** (agrupaciones de lecciones)
- **Lecciones** (agrupaciones de ejercicios)
- **Ejercicios** (unidades atómicas de aprendizaje)
- **Intentos** (cada vez que intenta un ejercicio)

Este sistema permite:
- Visualizar progreso en tiempo real
- Calcular porcentajes de completitud
- Identificar áreas de dificultad
- Desbloquear achievements por completar contenido
- Generar reportes analíticos

### Contexto

El progreso se rastrea en **3 niveles jerárquicos**:

```
Módulo (ej: "Introducción al Maya")
  ├─ Lección 1 (ej: "Saludos Básicos")
  │   ├─ Ejercicio 1 (multiple_choice)
  │   │   ├─ Intento 1 (fallido)
  │   │   └─ Intento 2 (exitoso)
  │   ├─ Ejercicio 2 (fill_in_blank)
  │   └─ Ejercicio 3 (matching_pairs)
  ├─ Lección 2 (ej: "Números Mayas")
  └─ Lección 3 (ej: "Familia")
```

### Alcance

**Incluye:**
- ✅ Tracking de progreso en 3 niveles (módulo, lección, ejercicio)
- ✅ 4 estados de progreso (not_started, in_progress, completed, mastered)
- ✅ 5 estados de intentos (started, in_progress, submitted, evaluated, discounted)
- ✅ Cálculo automático de porcentajes de completitud
- ✅ Registro de múltiples intentos por ejercicio
- ✅ Tracking de tiempo gastado
- ✅ Identificación de ejercicios dominados (mastered)

**Excluye:**
- ❌ Predicción de dificultad con ML (futuro)
- ❌ Recomendaciones personalizadas de contenido (futuro)

---

## ⚙️ Requerimientos Funcionales

### 1. Estados de Progreso (Módulos y Lecciones)

#### 1.1. Not Started (No Iniciado) 🔘

**Descripción:** El usuario no ha intentado ningún ejercicio

**Condiciones:**
- `exercises_completed = 0`
- `completion_percentage = 0`

**Transiciones posibles:**
- → `in_progress` (al completar primer ejercicio)

---

#### 1.2. In Progress (En Progreso) 🔵

**Descripción:** El usuario ha completado al menos 1 ejercicio, pero no todos

**Condiciones:**
- `0 < exercises_completed < exercises_total`
- `0 < completion_percentage < 100`

**Transiciones posibles:**
- → `completed` (al completar todos los ejercicios)

---

#### 1.3. Completed (Completado) ✅

**Descripción:** El usuario completó todos los ejercicios

**Condiciones:**
- `exercises_completed = exercises_total`
- `completion_percentage = 100`
- No necesariamente todos con puntuación perfecta

**Transiciones posibles:**
- → `mastered` (si todos los ejercicios tienen score >= 90%)

---

#### 1.4. Mastered (Dominado) 🏆

**Descripción:** El usuario completó todos los ejercicios con excelencia

**Condiciones:**
- `completion_percentage = 100`
- Todos los ejercicios con `score >= 90`
- Máximo 2 intentos por ejercicio (demostrar maestría rápida)

**Transiciones posibles:**
- Ninguna (estado final)

**Recompensas:**
- Achievement especial: "Maestría en [Módulo]"
- +50 ML Coins bonus
- Badge visual de maestría

---

### 2. Estados de Intentos (Exercise Attempts)

#### 2.1. Started (Iniciado)

**Descripción:** Usuario abrió el ejercicio pero no ha respondido

**Evento disparador:**
- Usuario navega a `/exercises/:id`
- Se crea registro en `exercise_attempts`

**Duración típica:** <30 segundos

---

#### 2.2. In Progress (En Curso)

**Descripción:** Usuario está resolviendo el ejercicio

**Evento disparador:**
- Usuario interactúa con el ejercicio (selecciona opción, escribe respuesta)

**Duración típica:** 30 segundos - 5 minutos

---

#### 2.3. Submitted (Enviado)

**Descripción:** Usuario envió respuesta para validación

**Evento disparador:**
- Usuario presiona "Verificar" o "Enviar Respuesta"

**Transición automática:** → `evaluated` (inmediatamente después de validar)

---

#### 2.4. Evaluated (Evaluado)

**Descripción:** Respuesta fue validada (correcta o incorrecta)

**Evento disparador:**
- Backend valida respuesta con `ExerciseValidator`

**Datos guardados:**
- `is_correct` (BOOLEAN)
- `score` (0-100)
- `feedback` (TEXT)
- `time_spent_seconds`

**Transiciones posibles:**
- Si `is_correct = true`: ejercicio marcado como completado
- Si `is_correct = false`: usuario puede reintentar (nuevo intento)

---

#### 2.5. Discounted (Descontado)

**Descripción:** Intento no cuenta para estadísticas (usado con comodín "Segunda Oportunidad")

**Evento disparador:**
- Usuario usa comodín "Segunda Oportunidad" después de fallar

**Efecto:**
- Este intento no rompe streak
- No afecta tasa de éxito
- No se contabiliza en estadísticas
- Permite reintentar sin penalización

---

### 3. Cálculo de Progreso

#### 3.1. Porcentaje de Completitud

**Fórmula:**
```sql
completion_percentage = (exercises_completed / exercises_total) * 100
```

**Actualización:**
- Trigger automático al completar ejercicio
- Se propaga desde Exercise → Lesson → Module

**Ejemplo:**
```
Módulo "Introducción al Maya":
- Total: 30 ejercicios
- Completados: 12
- Porcentaje: 40%
```

---

#### 3.2. Progreso en Tiempo Real

**Eventos que actualizan progreso:**
1. Completar ejercicio por primera vez
2. Mejorar score de ejercicio (si es_correct = false → true)
3. Alcanzar maestría (score >= 90 en todos)

**Propagación jerárquica:**
```
Completar Ejercicio
        ↓
Actualizar lesson_progress
        ↓
Actualizar module_progress
        ↓
Verificar achievements
        ↓
Notificar al usuario
```

---

### 4. Múltiples Intentos

#### 4.1. Límite de Intentos

| Escenario | Límite | Razón |
|-----------|--------|-------|
| **Ejercicios regulares** | Ilimitado | Fomentar aprendizaje por repetición |
| **Ejercicios de examen** | 1 intento | Evaluar conocimiento real |
| **Ejercicios de certificación** | 2 intentos | Balance entre rigor y oportunidad |

#### 4.2. Tracking de Intentos

**Tabla: `exercise_attempts`**

Cada intento guarda:
- `attempt_number`: 1, 2, 3, ...
- `score`: 0-100
- `is_correct`: true/false
- `time_spent_seconds`: tiempo gastado
- `started_at`, `submitted_at`
- `comodines_used`: JSONB con comodines usados

**Ejemplo de intentos:**
```
Exercise ID: abc-123 (Usuario: user-456)
├─ Intento 1: score=40, is_correct=false, time=120s
├─ Intento 2: score=60, is_correct=false, time=90s  (usó pista)
└─ Intento 3: score=100, is_correct=true, time=45s (SUCCESS)
```

---

### 5. Tracking de Tiempo

#### 5.1. Tiempo por Ejercicio

**Medición:**
- `started_at`: timestamp cuando abre ejercicio
- `submitted_at`: timestamp cuando envía respuesta
- `time_spent_seconds = submitted_at - started_at`

**Uso:**
- Identificar ejercicios que toman más tiempo (ajustar dificultad)
- Detectar usuarios que necesitan ayuda
- Estadísticas para content team

---

#### 5.2. Tiempo Acumulado

**Por Módulo:**
```sql
SELECT
    module_id,
    SUM(time_spent_seconds) as total_time_seconds
FROM progress_tracking.exercise_attempts
WHERE user_id = 'user-123'
GROUP BY module_id;
```

**Por Usuario (lifetime):**
```sql
SELECT
    user_id,
    SUM(time_spent_seconds) / 3600 as total_hours
FROM progress_tracking.exercise_attempts
GROUP BY user_id;
```

---

## 💼 Casos de Uso

### CU-PRG-001-001: Completar Primer Ejercicio de Módulo

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado
- Módulo en estado `not_started`

**Flujo Principal:**

1. Usuario completa primer ejercicio del módulo
2. Sistema registra intento en `exercise_attempts`:
   ```sql
   INSERT INTO exercise_attempts (
       user_id, exercise_id, attempt_number,
       status, is_correct, score
   ) VALUES (
       'user-123', 'exercise-456', 1,
       'evaluated', true, 100
   );
   ```
3. Sistema actualiza `lesson_progress`:
   - `exercises_completed` += 1
   - `completion_percentage` = (1 / 10) * 100 = 10%
   - `status` = 'in_progress'
4. Sistema actualiza `module_progress`:
   - `exercises_completed` += 1
   - `completion_percentage` = (1 / 30) * 100 = 3.3%
   - `status` = 'in_progress'
5. Sistema verifica achievements:
   - "Primera Lección Iniciada"
6. Sistema muestra notificación al usuario

**Postcondiciones:**
- Módulo: `in_progress` (3.3%)
- Lección: `in_progress` (10%)
- Achievement desbloqueado

---

### CU-PRG-001-002: Completar Módulo Completo

**Actor:** Estudiante
**Precondiciones:**
- Módulo en `in_progress`
- 29 de 30 ejercicios completados

**Flujo Principal:**

1. Usuario completa último ejercicio
2. Sistema actualiza `lesson_progress` a `completed` (100%)
3. Sistema actualiza `module_progress` a `completed` (100%)
4. Sistema verifica si califica para `mastered`:
   ```sql
   SELECT AVG(score) as avg_score
   FROM exercise_attempts
   WHERE user_id = 'user-123'
       AND exercise_id IN (SELECT id FROM exercises WHERE module_id = 'module-789')
       AND is_correct = true;
   ```
5. Si `avg_score >= 90`: promover a `mastered`
6. Sistema desbloquea achievements:
   - "Módulo Completado"
   - (Si mastered) "Maestría en [Módulo]"
7. Sistema otorga recompensas:
   - +100 ML Coins
   - (Si mastered) +50 ML Coins extra
8. Sistema envía notificación

**Postcondiciones:**
- Módulo: `completed` o `mastered` (100%)
- Achievements desbloqueados
- Recompensas otorgadas

---

### CU-PRG-001-003: Usar Comodín "Segunda Oportunidad"

**Actor:** Estudiante
**Precondiciones:**
- Usuario falló intento
- Usuario tiene comodín "Segunda Oportunidad"

**Flujo Principal:**

1. Usuario falla ejercicio (intento 1)
2. Sistema marca intento como `evaluated` con `is_correct = false`
3. Sistema muestra modal: "¿Usar Segunda Oportunidad?"
4. Usuario acepta
5. Sistema:
   - Marca intento 1 como `discounted = true`
   - Crea nuevo intento (intento 2)
   - No rompe streak
   - No afecta estadísticas
6. Usuario reintenta y acierta
7. Sistema marca ejercicio como completado correctamente

**Postcondiciones:**
- Ejercicio completado
- Streak preservado
- Intento 1 no cuenta en estadísticas

---

## 🔒 Consideraciones de Seguridad

### 1. Prevención de Manipulación

| Riesgo | Mitigación |
|--------|------------|
| **Marcar ejercicios como completados sin hacerlos** | Validación en backend, triggers en DB |
| **Modificar `completion_percentage` manualmente** | Campo calculado, solo modificable por triggers |
| **Crear múltiples intentos artificiales** | Rate limiting, detección de patrones sospechosos |

### 2. Validaciones Backend

```typescript
async completeExercise(userId: string, exerciseId: string, answer: any) {
  // 1. Validar que respuesta es correcta (en backend)
  const isCorrect = await this.validateAnswer(exerciseId, answer);

  if (!isCorrect) {
    throw new BadRequestException('Answer is incorrect');
  }

  // 2. Registrar intento
  await this.recordAttempt(userId, exerciseId, isCorrect);

  // 3. Actualizar progreso (delegado a triggers)
  // Los triggers se encargan de propagar cambios

  return { success: true };
}
```

---

## ✅ Criterios de Aceptación

### CA-PRG-001-001: Estados de Progreso

- [ ] Módulo comienza en `not_started`
- [ ] Cambia a `in_progress` al completar primer ejercicio
- [ ] Cambia a `completed` al completar todos los ejercicios
- [ ] Cambia a `mastered` si avg_score >= 90 y máx 2 intentos por ejercicio

### CA-PRG-001-002: Cálculo de Porcentajes

- [ ] `completion_percentage` se calcula correctamente
- [ ] Porcentaje se actualiza en tiempo real
- [ ] Porcentaje se propaga de ejercicio → lección → módulo

### CA-PRG-001-003: Múltiples Intentos

- [ ] Usuario puede reintentar ejercicios ilimitadamente (si no es examen)
- [ ] Cada intento se registra con `attempt_number` secuencial
- [ ] Solo el mejor intento cuenta para `mastered`

### CA-PRG-001-004: Estado `discounted`

- [ ] Intento marcado como `discounted` no afecta estadísticas
- [ ] No rompe streak
- [ ] Permite reintentar sin penalización

---

## 🧪 Testing

### Test Case 1: Completar Primer Ejercicio

```typescript
test('Completing first exercise updates module progress to in_progress', async () => {
  // Arrange
  const user = await createUser();
  const module = await createModule({ exercises_total: 10 });
  const exercise = await createExercise({ module_id: module.id });

  // Act
  await completeExercise(user.id, exercise.id, { answer: 'correct' });

  // Assert
  const moduleProgress = await getModuleProgress(user.id, module.id);
  expect(moduleProgress.status).toBe('in_progress');
  expect(moduleProgress.exercises_completed).toBe(1);
  expect(moduleProgress.completion_percentage).toBe(10);
});
```

### Test Case 2: Alcanzar Maestría

```typescript
test('Achieving 90% avg score promotes to mastered', async () => {
  // Arrange
  const user = await createUser();
  const module = await createModule({ exercises_total: 5 });
  const exercises = await createExercises(5, { module_id: module.id });

  // Act - Completar todos con scores altos
  for (const exercise of exercises) {
    await completeExercise(user.id, exercise.id, { score: 95 });
  }

  // Assert
  const moduleProgress = await getModuleProgress(user.id, module.id);
  expect(moduleProgress.status).toBe('mastered');
  expect(moduleProgress.completion_percentage).toBe(100);
});
```

---

## 📊 Métricas y Análisis

### KPIs a Monitorear

| Métrica | Cálculo | Objetivo |
|---------|---------|----------|
| **Tasa de completitud de módulos** | `(completed / started) * 100` | >60% |
| **Tiempo promedio por módulo** | `AVG(time_spent) GROUP BY module` | Identificar módulos largos |
| **Tasa de abandono** | `(in_progress never completed) / total` | <30% |
| **Ejercicios con más intentos** | `AVG(attempt_number) GROUP BY exercise` | Ajustar dificultad |

---

## 🔗 Referencias Adicionales

- [ET-PRG-001: Implementación de Tracking](../../02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-001-estados-progreso.md)
- [RF-EDU-001: Mecánicas de Ejercicios](../03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md)

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md`
**Propósito:** Requerimientos funcionales del sistema de tracking de progreso
**Audiencia:** Product Owner, Developers, QA Team
