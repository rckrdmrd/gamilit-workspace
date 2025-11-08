# US-CONT-002: Gestión de Ejercicios y Evaluaciones

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-CONT-002 |
| **Épica** | EXT-006 - Gestión de Contenido |
| **Título** | Sistema Avanzado de Creación de Ejercicios y Evaluaciones |
| **Prioridad** | Alta (P1) |
| **Story Points** | 8 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $4,600 MXN |

---

## Historia de Usuario

**Como** profesor
**Quiero** crear 40+ tipos de ejercicios interactivos, bancos de preguntas, rúbricas y evaluaciones
**Para** diseñar experiencias de aprendizaje variadas y efectivas sin limitaciones técnicas

---

## Valor de Negocio

### Impacto
- **Variedad**: 40+ mecánicas vs 6 hardcodeadas (667% aumento)
- **Autonomía**: Profesores crean sin developers
- **Engagement**: Variedad aumenta motivación 45%
- **Escalabilidad**: Contenido infinito generado por usuarios

### Métricas de Éxito
- >500 ejercicios creados en primer mes
- >30 tipos de mecánicas usados regularmente
- Tiempo de creación <5 minutos por ejercicio
- >85% satisfacción de profesores

---

## Criterios de Aceptación

### CA-01: 40+ Tipos de Ejercicios Interactivos
**Categorías de Mecánicas:**

**1. Selección (8 tipos)**
- Opción múltiple (1 respuesta correcta)
- Opción múltiple con múltiples respuestas
- Verdadero/Falso
- Matching (emparejar columnas)
- Ordenar secuencia
- Clasificar en categorías
- Hot spots en imagen (click en área correcta)
- Seleccionar de dropdown

**2. Input de Texto (6 tipos)**
- Respuesta corta (fill in the blank)
- Respuesta larga (essay)
- Completar espacios en blanco (cloze)
- Expresiones matemáticas (validar ecuación)
- Respuesta numérica (con tolerancia)
- Código de programación (validar sintaxis)

**3. Interactivos Visuales (8 tipos)**
- Drag & drop (arrastrar elementos)
- Conectar puntos (draw connections)
- Diagramas interactivos (label diagram)
- Timeline (ordenar eventos en línea temporal)
- Mapas interactivos (seleccionar ubicaciones)
- Puzzles (rompecabezas)
- Simulaciones (ej: experimento virtual)
- Gráficos interactivos (plot points)

**4. Audio/Video (4 tipos)**
- Escuchar audio y responder
- Ver video y responder
- Transcripción de audio
- Análisis de video con timestamps

**5. Gamificados (6 tipos)**
- Flashcards (repaso con tarjetas)
- Memory game (encontrar pares)
- Quiz show style
- Escape room (resolver para avanzar)
- Trivia con temporizador
- Battle (competir contra otro estudiante)

**6. Evaluativos (5 tipos)**
- Autoevaluación (reflexión)
- Peer review (evaluar trabajo de compañero)
- Rúbricas con criterios
- Portfolio assessment
- Project-based (subir evidencias)

**7. Creativos (3 tipos)**
- Dibujo libre (canvas)
- Grabación de audio (respuesta oral)
- Grabación de video (presentación)

### CA-02: Banco de Preguntas
- Crear biblioteca centralizada de preguntas
- Organizar por: Módulo, Tema, Dificultad, Tags
- Búsqueda y filtrado avanzado
- Reutilizar preguntas en múltiples tareas
- Importar preguntas desde CSV/Excel
- Exportar banco como backup
- Compartir preguntas entre profesores (opcional)
- Marcar preguntas como favoritas
- Estadísticas de uso (cuántas veces usada)

### CA-03: Templates Predefinidos
- 50+ plantillas de ejercicios listos para usar
- Categorías: Matemáticas, Ciencias, Lenguaje, Historia, etc.
- Editar template para personalizar
- Duplicar template como punto de partida
- Community templates (compartidos por usuarios)
- Rating de templates (estrellas)

### CA-04: Creación de Tareas con Múltiples Ejercicios
- Agregar 1-50 ejercicios a una tarea
- Ordenar ejercicios con drag & drop
- Configurar por tarea:
  - Título, descripción, instrucciones
  - Fecha límite (deadline)
  - Intentos permitidos (1, 2, 3, ilimitados)
  - Mostrar respuestas después de enviar (sí/no)
  - Aleatorizar orden de ejercicios
  - Modo de evaluación (formativa/sumativa)
- Preview de tarea completa antes de publicar
- Publicar inmediatamente o programar fecha

### CA-05: Evaluaciones Sumativas (Exámenes)
- Crear exámenes formales con:
  - Tiempo límite total (ej: 60 minutos)
  - Intentos únicos (no retries)
  - Modo lockdown (pantalla completa, no salir)
  - Aleatorización de preguntas (diferente para cada estudiante)
  - Banco de preguntas (escoger N de M)
- Configurar pesos por sección
- Auto-calificación automática
- Revisión manual para preguntas abiertas
- Detección de patrones sospechosos (anti-cheating básico)

### CA-06: Rúbricas de Evaluación
- Crear rúbricas con múltiples criterios
- Escala configurable (1-5, 1-10, etc.)
- Descriptores por nivel (excelente, bueno, regular, deficiente)
- Asignar rúbrica a ejercicios/tareas
- Evaluar usando rúbrica (checkboxes)
- Cálculo automático de puntuación final
- Exportar rúbrica como PDF
- Templates de rúbricas predefinidas

### CA-07: Configuración de Puntuación
- Asignar puntos a cada ejercicio
- Pesos por categoría (ej: 40% teoría, 60% práctica)
- Puntos parciales (si responde 3 de 5 correctas)
- Penalización por respuesta incorrecta (opcional)
- Extra credit questions (puntos bonus)
- Escala de calificación (0-100, 0-10, A-F)
- Normalización automática de scores

### CA-08: Aleatorización de Preguntas
- Crear pool de preguntas (ej: 50 preguntas)
- Seleccionar N aleatorias por estudiante (ej: 20)
- Aleatorizar orden de opciones (en opción múltiple)
- Aleatorizar valores numéricos (ej: 2+3, 5+7 variantes)
- Prevenir copia entre estudiantes
- Semilla aleatoria reproducible (para debug)

### CA-09: Límites de Tiempo por Ejercicio
- Configurar tiempo máximo por ejercicio (opcional)
- Timer visible al estudiante
- Auto-enviar al acabar tiempo
- Advertencia cuando quedan 30 segundos
- Penalización por timeout (opcional)
- Pausar timer en caso de problemas técnicos (admin)

### CA-10: Feedback Automático
- Configurar feedback por respuesta:
  - Correcta: "¡Excelente! Aquí está por qué..."
  - Incorrecta: "No exactamente. Recuerda que..."
- Hints progresivos (si falla, dar pista)
- Explicaciones detalladas después de enviar
- Links a recursos de repaso
- Video explicativo embebido

### CA-11: Adaptabilidad y Ramificación
- Ejercicios adaptativos (si falla, da ejercicio más fácil)
- Ramificación condicional (if score >80%, skip to module 5)
- Prerequisitos (debe completar ejercicio X antes de Y)
- Desbloquear contenido según performance
- Paths personalizados por estudiante

### CA-12: Analytics de Ejercicios
- Estadísticas por ejercicio:
  - % de aciertos
  - Tiempo promedio de completación
  - Distribución de respuestas
  - Ítems más difíciles (menor % aciertos)
- Item analysis para mejorar preguntas
- Detectar preguntas ambiguas (alta variación)
- Heatmap de dificultad

### CA-13: Accesibilidad
- Ejercicios compatibles con screen readers
- Alternativas textuales para imágenes
- Tiempo extra configurable por estudiante (accommodations)
- Contraste alto en modo accesible
- Navegación por teclado
- Text-to-speech para instrucciones

### CA-14: Mobile-Friendly
- Todos los tipos de ejercicios funcionan en mobile
- Touch-optimized (botones grandes)
- Swipe gestures donde aplique
- Teclado numérico para inputs numéricos
- Auto-save en mobile (no perder progreso)

### CA-15: Integración con LMS
- Exportar tareas como SCORM 1.2/2004
- Importar desde Moodle XML
- Compatible con LTI (Learning Tools Interoperability)
- Exportar resultados a SIS (Student Information Systems)
- Webhooks para sincronizar con plataformas externas

---

## Especificaciones Técnicas

### Frontend Components
```
src/features/exercise-builder/
├── components/
│   ├── ExerciseTypeSelector.tsx
│   ├── builders/
│   │   ├── MultipleChoiceBuilder.tsx
│   │   ├── DragDropBuilder.tsx
│   │   ├── MathInputBuilder.tsx
│   │   ├── HotSpotBuilder.tsx
│   │   └── [35+ more builders...]
│   ├── QuestionBank.tsx
│   ├── TaskComposer.tsx
│   ├── RubricBuilder.tsx
│   ├── ScoringConfig.tsx
│   └── PreviewExercise.tsx
└── hooks/
    ├── useExerciseBuilder.ts
    └── useQuestionBank.ts
```

### Backend Schema
```typescript
interface Exercise {
  id: string;
  type: ExerciseType; // 40+ types
  question: string;
  config: ExerciseConfig; // type-specific config
  correctAnswer: any; // varies by type
  points: number;
  timeLimit?: number;
  feedback: {
    correct: string;
    incorrect: string;
    hints: string[];
  };
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    bloomsLevel: number; // 1-6
  };
}

interface Task {
  id: string;
  title: string;
  exercises: Exercise[];
  config: {
    deadline?: Date;
    attempts: number;
    showAnswers: boolean;
    randomize: boolean;
    timeLimit?: number;
  };
  rubric?: Rubric;
}

interface Rubric {
  id: string;
  criteria: Criterion[];
  scale: { min: number; max: number };
}
```

---

## Diferenciación con Alcance Inicial

### Alcance Inicial (EAI-002)
- 6 mecánicas hardcodeadas
- Sin variedad
- Sin banco de preguntas
- Creación rígida

### Esta Historia (EXT-006)
- **40+ tipos de ejercicios**
- **Banco de preguntas reutilizable**
- **Templates y variedad**
- **Rúbricas y evaluaciones sumativas**
- **Aleatorización y adaptabilidad**
- **Analytics de ítems**
- Esto es **plataforma de assessment profesional**

---

## Dependencias

### Depende de
- **US-CONT-001**: Editor WYSIWYG (para instrucciones)
- **EAI-002**: Sistema base de mecánicas

---

## Definición de Terminado (DoD)

- [ ] 40+ tipos de ejercicios implementados
- [ ] Banco de preguntas funcional
- [ ] 50+ templates predefinidos
- [ ] Composer de tareas con múltiples ejercicios
- [ ] Sistema de rúbricas
- [ ] Configuración de puntuación
- [ ] Aleatorización de preguntas
- [ ] Límites de tiempo
- [ ] Feedback automático
- [ ] Evaluaciones sumativas
- [ ] Analytics de ejercicios
- [ ] Exportación SCORM/Moodle
- [ ] Mobile-friendly todos los tipos
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Tests >80% coverage
- [ ] Documentación de cada tipo
- [ ] Video tutoriales

---

## Estimación Detallada (8 SP)

| Tarea | Horas |
|-------|-------|
| Diseño de 40 tipos | 12h |
| Implementación de builders (40 tipos) | 60h |
| Banco de preguntas | 10h |
| Task composer | 10h |
| Rúbricas | 8h |
| Scoring config | 6h |
| Aleatorización | 8h |
| Feedback system | 6h |
| Analytics | 8h |
| Backend API | 12h |
| Testing | 14h |
| Documentación | 8h |
| **TOTAL** | **162h** |

**Presupuesto**: $4,600 MXN
**Duración**: 4-5 días

---

## Tags

#ext-006 #ejercicios #assessment #evaluacion #rubricas #banco-preguntas #gamificacion #mes-3

---

**Creado**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Origen**: EP005/US-005-11 + EAI-002 (extensión masiva)
**Compliance**: PF-001 (XXX líneas)
