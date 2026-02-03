# RF-M3-001: Especificación de Ejercicios - Módulo 3

**Versión:** 1.0
**Fecha:** 2026-01-07
**Estado:** IMPLEMENTADO
**Módulo:** M3 - Lectura Crítica

---

## Resumen

El Módulo 3 (Lectura Crítica) contiene 5 ejercicios diseñados para desarrollar habilidades de pensamiento crítico y evaluación de información. **Todos los ejercicios requieren evaluación manual del maestro** (`requires_manual_grading = true`).

---

## Ejercicios del Módulo 3

### M3.1: Análisis de Fuentes Históricas

**Tipo:** `analisis_fuentes`
**Order Index:** 3
**Puntos Máximos:** 100
**XP Reward:** 150
**ML Coins Reward:** 30

#### Descripción
El estudiante evalúa la credibilidad de 5 fuentes históricas utilizando el método CRAAP (Currency, Relevance, Authority, Accuracy, Purpose).

#### Mecánica
1. Estudiante recibe 5 textos sobre Marie Curie
2. Debe ordenar las fuentes de más a menos confiable (drag & drop)
3. Justificar el ranking en 2-3 líneas por fuente

#### Flujo de Validación
```
Estudiante completa ranking → Envía respuesta →
Mensaje: "Tu análisis ha sido enviado para revisión del maestro" →
Maestro evalúa calidad del ranking y justificaciones →
Asigna score → Notificación al estudiante con recompensas
```

#### Criterios de Evaluación (Rúbrica)
| Criterio | Peso | Descripción |
|----------|------|-------------|
| Orden correcto | 40% | Ranking coincide con orden esperado |
| Justificaciones | 30% | Calidad de las razones dadas |
| Uso de método CRAAP | 20% | Menciona criterios correctamente |
| Coherencia | 10% | Lógica interna del análisis |

#### Configuración en BD
```sql
INSERT INTO exercises (
  exercise_type, requires_manual_grading, xp_reward, ml_coins_reward
) VALUES (
  'analisis_fuentes', true, 150, 30
);
```

---

### M3.2: Debate Digital Estructurado

**Tipo:** `debate_digital`
**Order Index:** 1
**Puntos Máximos:** 100
**XP Reward:** 150
**ML Coins Reward:** 30

#### Descripción
El estudiante participa en un debate argumentado sobre decisiones éticas de Marie Curie, defendiendo o refutando una posición.

#### Mecánica
1. Se presenta un dilema ético (ej: "¿Debió Marie compartir sus descubrimientos libremente?")
2. Estudiante elige posición (a favor / en contra / neutral)
3. Escribe argumento principal (mín. 150 palabras)
4. Responde a contra-argumento generado

#### Flujo de Validación
```
Estudiante elige posición → Escribe argumentos → Envía →
Mensaje: "Tu ejercicio ha sido enviado para revisión del maestro" →
Maestro evalúa calidad argumentativa →
Asigna score → Notificación con recompensas
```

#### Criterios de Evaluación (Rúbrica)
| Criterio | Peso | Descripción |
|----------|------|-------------|
| Claridad argumental | 30% | Argumento bien estructurado |
| Uso de evidencia | 25% | Cita hechos o fuentes |
| Respeto al otro | 15% | Tono respetuoso |
| Contra-argumentación | 20% | Responde efectivamente |
| Originalidad | 10% | Perspectiva única |

---

### M3.3: Matriz de Perspectivas

**Tipo:** `matriz_perspectivas`
**Order Index:** 5
**Puntos Máximos:** 100
**XP Reward:** 150
**ML Coins Reward:** 30

#### Descripción
El estudiante analiza un evento histórico (Nobel de Química 1911) desde 6 perspectivas diferentes.

#### Mecánica
1. Se presenta el evento: "Marie gana el Nobel de Química en medio de escándalo personal"
2. Estudiante completa matriz con 6 perspectivas:
   - Marie Curie
   - Pierre Curie (póstumo)
   - Científicos contemporáneos
   - Prensa de la época
   - Mujeres de la época
   - Sociedad polaca
3. Por cada perspectiva: reacción emocional + opinión + consecuencias

#### Flujo de Validación
```
Estudiante completa las 6 perspectivas → Envía →
Mensaje: "Tu análisis ha sido enviado para revisión del maestro" →
Maestro evalúa profundidad y precisión histórica →
Asigna score → Notificación con recompensas
```

#### Criterios de Evaluación
| Criterio | Peso | Descripción |
|----------|------|-------------|
| Completitud | 20% | Todas las celdas llenas (mín. 50 chars) |
| Precisión histórica | 25% | Hechos correctos |
| Empatía | 20% | Entiende cada perspectiva |
| Coherencia | 20% | Lógica interna |
| Profundidad | 15% | Análisis más allá de lo superficial |

---

### M3.4: Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Order Index:** 2
**Puntos Máximos:** 100
**XP Reward:** 150
**ML Coins Reward:** 30

#### Descripción
El estudiante crea un podcast de 2 minutos defendiendo o criticando una decisión de Marie Curie.

#### Mecánica
1. Elige tema/decisión a argumentar
2. Graba audio de 120-180 segundos con estructura:
   - Introducción (30 seg)
   - Desarrollo con 3 argumentos (60 seg)
   - Conclusión (30 seg)
3. Requisitos: 3 datos verificables, 2 citas/referencias

#### Flujo de Validación
```
Estudiante graba audio → Sube archivo → Envía →
Mensaje: "Tu podcast ha sido enviado para revisión del maestro" →
Maestro escucha y evalúa →
Asigna score → Notificación con recompensas
```

#### Criterios de Evaluación
| Criterio | Peso | Descripción |
|----------|------|-------------|
| Estructura | 25% | Sigue formato intro-desarrollo-cierre |
| Argumentación | 30% | Calidad de los 3 argumentos |
| Datos verificables | 20% | Menciona hechos correctos |
| Claridad vocal | 15% | Dicción y ritmo |
| Creatividad | 10% | Enganche y originalidad |

---

### M3.5: Tribunal de Opiniones

**Tipo:** `tribunal_opiniones`
**Order Index:** 4
**Puntos Máximos:** 100
**XP Reward:** 150
**ML Coins Reward:** 30

#### Descripción
El estudiante clasifica afirmaciones/opiniones según su nivel de fundamentación, actuando como "juez" de argumentos.

#### Mecánica
1. Se presentan 8-10 afirmaciones sobre Marie Curie
2. Clasificar cada una como:
   - "Bien fundamentada" (con evidencia)
   - "Parcialmente fundamentada" (algo de evidencia)
   - "Sin fundamento" (solo opinión)
3. Justificar cada clasificación en 2-3 líneas

#### Flujo de Validación
```
Estudiante clasifica afirmaciones → Agrega justificaciones → Envía →
Mensaje: "Tu evaluación ha sido enviada para revisión del maestro" →
Maestro evalúa clasificaciones y justificaciones →
Asigna score → Notificación con recompensas
```

#### Criterios de Evaluación
| Criterio | Peso | Descripción |
|----------|------|-------------|
| Clasificación correcta | 40% | Categoría adecuada por afirmación |
| Justificaciones | 35% | Calidad de las razones |
| Consistencia | 15% | Aplica mismo criterio a todas |
| Redacción | 10% | Claridad en justificaciones |

---

## Configuración Común

### Flags de Base de Datos
```sql
-- Todos los ejercicios M3 tienen:
requires_manual_grading = true
auto_gradable = false
```

### Mensaje de Confirmación (Frontend)
```typescript
if (response.status === 'pending_review' || response.requiresManualReview) {
  setFeedback({
    type: 'info',
    title: '[Título según ejercicio]',
    message: 'Tu [ejercicio] ha sido enviado/a para revisión del maestro. ' +
             'Recibirás tus recompensas cuando sea evaluado/a.',
    pendingReview: true,
  });
}
```

### Triggers de Recompensas
Al calificar, se disparan automáticamente:
- `trg_update_user_stats_on_submission` → Suma XP y ML Coins
- `trg_update_module_progress_on_submission` → Actualiza progreso
- `trg_update_missions_on_submission` → Actualiza misiones

---

## Referencias

- `DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` - Líneas 573-779
- `04-exercises-module3.sql` - Seeds de ejercicios
- `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` - Flujo de validación

---

*Documento creado como parte de la documentación del Módulo 3*
