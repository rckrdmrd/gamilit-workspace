# ADR-004: Arquitectura Modular del Exercise Engine (23 Tipos)

**Fecha:** 2025-09-01
**Estado:** Aceptada
**Autor:** Equipo GAMILIT

---

## Contexto

GAMILIT necesita soportar 23 tipos de ejercicios diferentes distribuidos en 5 modulos educativos. Cada tipo tiene mecanicas de interaccion, evaluacion y scoring diferentes:

- **Modulo 1 (Literal):** Crucigrama, linea de tiempo, completar espacios, V/F, sopa de letras
- **Modulo 2 (Inferencial):** Detective, hipotesis, prediccion, puzzle contexto, rueda inferencias
- **Modulo 3 (Critica):** Tribunal, debate, analisis fuentes, podcast, matriz perspectivas
- **Modulo 4 (Digital):** Fake news, infografia, quiz TikTok, hipertextual, memes
- **Modulo 5 (Produccion):** Diario multimedia, comic digital, video carta

Necesitamos una arquitectura que permita agregar nuevos tipos sin modificar el core, evaluar automatica y manualmente, y mantener scoring consistente.

---

## Decision

Implementar un **Exercise Engine modular** basado en el patron Strategy + Factory, donde cada tipo de ejercicio implementa una interfaz comun pero tiene su propia logica de evaluacion.

### Arquitectura:

```typescript
// Interfaz comun para todos los tipos
interface ExerciseEvaluator {
  type: ExerciseType;
  evaluate(submission: Submission): EvaluationResult;
  generateFeedback(result: EvaluationResult): Feedback;
  calculateScore(result: EvaluationResult): Score;
}

// Factory
class ExerciseEvaluatorFactory {
  getEvaluator(type: ExerciseType): ExerciseEvaluator;
}

// Registro de evaluadores (23 implementaciones)
@Injectable()
class CrosswordEvaluator implements ExerciseEvaluator { ... }
class TimelineEvaluator implements ExerciseEvaluator { ... }
class DetectiveEvaluator implements ExerciseEvaluator { ... }
// ... 20 more
```

### Modos de evaluacion:
| Modo | Modulos | Mecanismo |
|------|---------|-----------|
| Automatica | 1, 2, 4 | Comparacion con respuesta correcta / fuzzy matching |
| Semi-automatica | 3 | Rubrica + evaluacion manual opcional |
| Manual | 5 | Maestro evalua con rubrica (produccion) |

### Scoring unificado:
```typescript
interface Score {
  raw_score: number;     // 0-100
  time_bonus: number;    // 0-20
  accuracy: number;      // 0.0-1.0
  final_score: number;   // Ajustado
  xp_awarded: number;    // XP calculado
  ml_coins_awarded: number;
}
```

### Spaced Repetition integrado:
Cada ejercicio completado alimenta el motor de repeticion espaciada, que programa la proxima aparicion del ejercicio basado en el score obtenido.

---

## Consecuencias

### Positivas
- **Extensible:** Agregar tipo 24, 25, etc. solo requiere nueva clase que implemente la interfaz
- **Testeable:** Cada evaluador se prueba independientemente
- **Scoring consistente:** Todos los tipos generan un Score con la misma estructura
- **Integracion limpia:** El gamification engine recibe Score estandar sin importar el tipo
- **Evaluacion mixta:** Soporta auto, semi-auto y manual sin cambiar la arquitectura

### Negativas
- **23 implementaciones:** Cada tipo necesita su propia logica (alto volumen de codigo)
- **Testing:** 23 evaluadores = 23 suites de tests
- **Frontend:** Cada tipo necesita su propio componente de UI (23 componentes de ejercicio)
- **Complejidad de datos:** Cada tipo tiene estructura de submission/respuesta diferente (JSONB)

### Mitigaciones
- Base class abstracta con logica comun (timestamps, logging, scoring base)
- Shared components en frontend para elementos comunes (timer, progress bar, submit button)
- JSONB en PostgreSQL para datos flexibles de submission por tipo
- Template de generacion de nuevo tipo (scaffolding script)

---

## Alternativas Consideradas

### 1. Evaluador monolitico con switch/case
- **Rechazada:** No escalable, violacion de SRP, testing dificil

### 2. Evaluacion basada en reglas (DSL)
- **Rechazada:** Complejidad excesiva para el MVP, tipos como "debate" requieren logica compleja

### 3. Evaluacion 100% manual (maestro)
- **Rechazada:** No escalable, bottleneck en maestros, latencia en feedback

### 4. Microservicios por tipo de ejercicio
- **Rechazada:** Over-engineering para 22 modulos en monorepo, complejidad operativa innecesaria

---

## Registro de Tipos

| # | Tipo | Evaluacion | Complejidad |
|---|------|------------|-------------|
| 1 | crossword | Auto | Media |
| 2 | timeline | Auto | Baja |
| 3 | fill_blanks | Auto | Baja |
| 4 | true_false | Auto | Baja |
| 5 | word_search | Auto | Media |
| 6 | detective | Auto | Alta |
| 7 | hypothesis | Auto | Media |
| 8 | prediction | Auto | Media |
| 9 | context_puzzle | Auto | Media |
| 10 | inference_wheel | Auto | Media |
| 11 | opinion_court | Semi-auto | Alta |
| 12 | digital_debate | Semi-auto | Alta |
| 13 | source_analysis | Semi-auto | Alta |
| 14 | argumentative_podcast | Manual | Alta |
| 15 | perspectives_matrix | Semi-auto | Alta |
| 16 | fake_news_verifier | Auto | Media |
| 17 | interactive_infographic | Auto | Media |
| 18 | tiktok_quiz | Auto | Baja |
| 19 | hypertextual_navigation | Auto | Media |
| 20 | meme_analysis | Semi-auto | Media |
| 21 | multimedia_diary | Manual | Alta |
| 22 | digital_comic | Manual | Alta |
| 23 | video_letter | Manual | Alta |

---

*ADR-004 - Aceptada*
