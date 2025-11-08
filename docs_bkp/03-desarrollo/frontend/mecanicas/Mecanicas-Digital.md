# Módulo 4: Mecánicas de Textos Digitales y Multimediales

**Objetivo Pedagógico:** Interpretar textos digitales, visuales y multimodales
**Total de Mecánicas:** 9
**Archivos de implementación:** 19

---

## Resumen del Módulo

Este módulo implementa 9 mecánicas educativas enfocadas en la interpretación de textos digitales, visuales y multimodales. Estas mecánicas ayudan a los estudiantes a desenvolverse en el ecosistema digital actual, desarrollando alfabetización mediática y habilidades de análisis crítico de contenido digital.

---

## 1. Verificador de Fake News

**Tipo:** `verificador_fakenews` | `fake_news`
**Descripción:** Identificar noticias falsas y verificar información

### Componente destacado

```typescript
// features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx
interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  source: string;
  date: string;
  image?: string;
  isFake: boolean;
  redFlags?: string[];
}

export const VerificadorFakeNewsExercise: React.FC<VerificadorProps> = ({
  articles,
  ...baseProps
}) => {
  const [currentArticle, setCurrentArticle] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, boolean>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});

  const handleVerdict = (articleId: string, isFake: boolean, justification: string) => {
    setVerdicts(prev => ({ ...prev, [articleId]: isFake }));
    setJustifications(prev => ({ ...prev, [articleId]: justification }));
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="fake-news-detector">
        <ArticleViewer article={articles[currentArticle]} />

        <FactCheckDashboard
          article={articles[currentArticle]}
          onCheckComplete={(checks) => {
            // Procesar verificaciones
          }}
        />

        <VerdictPanel
          onSubmit={(isFake, justification) => {
            handleVerdict(articles[currentArticle].id, isFake, justification);
            if (currentArticle < articles.length - 1) {
              setCurrentArticle(prev => prev + 1);
            }
          }}
        />
      </div>
    </BaseExercise>
  );
};
```

### Características

- Análisis de fuente
- Verificación de hechos
- Detección de señales de alerta
- Cross-referencing

### Componentes adicionales

```typescript
// FactCheckDashboard.tsx
interface FactCheckDashboardProps {
  article: NewsArticle;
  onCheckComplete: (checks: FactCheck[]) => void;
}

export const FactCheckDashboard: React.FC<FactCheckDashboardProps> = ({
  article,
  onCheckComplete,
}) => {
  const [checks, setChecks] = useState<FactCheck[]>([]);

  const checkCriteria = [
    { id: 'source', label: 'Credibilidad de la fuente', weight: 0.3 },
    { id: 'author', label: 'Autor identificable', weight: 0.15 },
    { id: 'date', label: 'Fecha actual y clara', weight: 0.1 },
    { id: 'evidence', label: 'Evidencia verificable', weight: 0.25 },
    { id: 'language', label: 'Lenguaje objetivo', weight: 0.2 },
  ];

  return (
    <div className="fact-check-dashboard">
      <h3>Verificación de Hechos</h3>
      {checkCriteria.map(criterion => (
        <CheckCriterion
          key={criterion.id}
          criterion={criterion}
          onCheck={(passed) => {
            setChecks(prev => [...prev, { criterionId: criterion.id, passed }]);
          }}
        />
      ))}
    </div>
  );
};
```

---

## 2. Quiz TikTok

**Tipo:** `quiz_tiktok`
**Descripción:** Cuestionario con interfaz estilo TikTok

### Características

- Swipe gestures
- Videos cortos
- Preguntas rápidas
- Interfaz vertical

### Componente de Swipe

```typescript
// features/mechanics/module4/QuizTikTok/SwipeGesture.tsx
export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  onSwipeLeft,
  onSwipeRight,
  children,
}) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    setOffsetX(currentX - startX);
  };

  const handleTouchEnd = () => {
    if (offsetX > 100) {
      onSwipeRight();
    } else if (offsetX < -100) {
      onSwipeLeft();
    }
    setOffsetX(0);
  };

  return (
    <div
      className="swipeable-container"
      style={{ transform: `translateX(${offsetX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};
```

### Ejercicio completo

```typescript
// features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx
interface QuizTikTokProps extends BaseExerciseProps {
  questions: TikTokQuestion[];
}

interface TikTokQuestion {
  id: string;
  video?: string;
  image?: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const QuizTikTokExercise: React.FC<QuizTikTokProps> = ({
  questions,
  ...baseProps
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleSwipe = (direction: 'left' | 'right') => {
    // Swipe left = respuesta incorrecta, right = respuesta correcta
    const answer = direction === 'right' ? 1 : 0;
    setAnswers(prev => [...prev, answer]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="quiz-tiktok-container">
        <SwipeGesture
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
        >
          <div className="tiktok-card">
            {questions[currentQuestion].video && (
              <video
                src={questions[currentQuestion].video}
                autoPlay
                loop
                muted
              />
            )}
            {questions[currentQuestion].image && (
              <img src={questions[currentQuestion].image} alt="Question" />
            )}

            <div className="question-overlay">
              <h3>{questions[currentQuestion].question}</h3>
              <div className="options">
                {questions[currentQuestion].options.map((option, idx) => (
                  <div key={idx} className="option">
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className="swipe-indicators">
              <span className="indicator-left">✗</span>
              <span className="indicator-right">✓</span>
            </div>
          </div>
        </SwipeGesture>

        <div className="progress">
          {currentQuestion + 1} / {questions.length}
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 3. Navegación Hipertextual

**Tipo:** `navegacion_hipertextual`
**Descripción:** Navegar por documentos enlazados

### Características

- Hipertexto interactivo
- Breadcrumbs de navegación
- Mapa de documentos
- Tracking de rutas

### Implementación

```typescript
// features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise.tsx
interface HypertextProps extends BaseExerciseProps {
  documents: HypertextDocument[];
  startDocument: string;
  targetDocument: string;
  questions: NavigationQuestion[];
}

interface HypertextDocument {
  id: string;
  title: string;
  content: string;
  links: HypertextLink[];
}

interface HypertextLink {
  text: string;
  targetDocId: string;
}

export const NavegacionHipertextualExercise: React.FC<HypertextProps> = ({
  documents,
  startDocument,
  targetDocument,
  questions,
  ...baseProps
}) => {
  const [currentDoc, setCurrentDoc] = useState(startDocument);
  const [visitedDocs, setVisitedDocs] = useState<string[]>([startDocument]);
  const [navigationPath, setNavigationPath] = useState<string[]>([startDocument]);

  const navigateTo = (docId: string) => {
    setCurrentDoc(docId);
    setVisitedDocs(prev => [...new Set([...prev, docId])]);
    setNavigationPath(prev => [...prev, docId]);
  };

  const currentDocument = documents.find(d => d.id === currentDoc);

  return (
    <BaseExercise {...baseProps}>
      <div className="hypertext-container">
        <div className="navigation-header">
          <Breadcrumbs path={navigationPath} documents={documents} />
          <DocumentMap
            documents={documents}
            visited={visitedDocs}
            current={currentDoc}
            target={targetDocument}
          />
        </div>

        <div className="document-viewer">
          <h2>{currentDocument?.title}</h2>
          <div className="content">
            {parseHypertextContent(currentDocument?.content, (linkId) => navigateTo(linkId))}
          </div>

          <div className="links-section">
            <h3>Enlaces en este documento</h3>
            {currentDocument?.links.map(link => (
              <HypertextLinkButton
                key={link.targetDocId}
                link={link}
                visited={visitedDocs.includes(link.targetDocId)}
                onClick={() => navigateTo(link.targetDocId)}
              />
            ))}
          </div>
        </div>

        <div className="questions-panel">
          <h3>Preguntas de Comprensión</h3>
          {questions.map(question => (
            <NavigationQuestionCard
              key={question.id}
              question={question}
              canAnswer={visitedDocs.includes(question.requiredDoc)}
            />
          ))}
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 4. Análisis de Memes

**Tipo:** `analisis_memes`
**Descripción:** Interpretar significado de memes

### Características

- Anotación de elementos visuales
- Análisis de contexto cultural
- Identificación de referencias
- Interpretación multimodal

---

## 5. Infografía Interactiva

**Tipo:** `infografia_interactiva`
**Descripción:** Explorar e interpretar infografías

### Características

- Elementos interactivos
- Tooltips informativos
- Preguntas contextuales
- Visualización de datos

---

## 6. Email Formal

**Tipo:** `email_formal`
**Descripción:** Redactar correos formales

### Características

- Editor de email
- Plantillas
- Validación de formato
- Retroalimentación de estilo

---

## 7. Chat Literario

**Tipo:** `chat_literario`
**Descripción:** Conversación con personajes literarios

### Características

- Interfaz de chat
- Respuestas contextuales
- Análisis de diálogo
- Coherencia narrativa

---

## 8. Ensayo Argumentativo

**Tipo:** `ensayo_argumentativo`
**Descripción:** Escribir ensayos estructurados

### Características

- Editor de texto
- Estructura guiada
- Verificación de argumentos
- Análisis de coherencia

---

## 9. Reseña Crítica

**Tipo:** `resena_critica`
**Descripción:** Escribir reseñas críticas

### Características

- Plantilla de reseña
- Criterios de evaluación
- Soporte multimedia
- Publicación

---

## Sistema de Scoring

### Cálculo de Puntuación

```typescript
// features/mechanics/shared/scoring.ts
export const calculateScore = (
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  estimatedTime: number,
  hintsUsed: number,
  difficulty: string
): ScoreResult => {
  // Base score (0-100)
  const baseScore = (correctAnswers / totalQuestions) * 100;

  // Time bonus (max 20 points)
  const timeRatio = timeSpent / (estimatedTime * 60);
  const timeBonus = timeRatio < 0.8 ? 20 * (0.8 - timeRatio) / 0.8 : 0;

  // Accuracy bonus (max 10 points)
  const accuracy = correctAnswers / totalQuestions;
  const accuracyBonus = accuracy === 1 ? 10 : accuracy > 0.9 ? 5 : 0;

  // Hint penalty
  const hintPenalty = hintsUsed * 5;

  // Difficulty multiplier
  const difficultyMultiplier = {
    facil: 1.0,
    medio: 1.2,
    dificil: 1.5,
    experto: 2.0,
  }[difficulty] || 1.0;

  const totalScore = Math.max(
    0,
    (baseScore + timeBonus + accuracyBonus - hintPenalty) * difficultyMultiplier
  );

  // Calculate rewards
  const mlCoins = Math.floor(totalScore * 0.5);
  const xpGained = Math.floor(totalScore * 2);

  return {
    baseScore,
    timeBonus,
    accuracyBonus,
    totalScore: Math.round(totalScore),
    mlCoins,
    xpGained,
    correctAnswers,
    totalQuestions,
    grade: calculateGrade(totalScore),
  };
};

const calculateGrade = (score: number): ScoreResult['grade'] => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};
```

### Feedback al Usuario

```typescript
// features/mechanics/shared/components/FeedbackModal.tsx
export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  result,
  onClose,
}) => {
  const feedbackMessage = getFeedbackMessage(result.grade);
  const showConfetti = result.grade === 'A+' || result.grade === 'A';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {showConfetti && <Confetti />}

      <div className="feedback-content">
        <h2 className={`grade grade-${result.grade}`}>{result.grade}</h2>

        <p className="feedback-message">{feedbackMessage}</p>

        <div className="score-breakdown">
          <ScoreItem label="Puntuación Base" value={result.baseScore} />
          <ScoreItem label="Bonus de Tiempo" value={result.timeBonus} />
          <ScoreItem label="Bonus de Precisión" value={result.accuracyBonus} />
          <Divider />
          <ScoreItem
            label="Total"
            value={result.totalScore}
            highlight
          />
        </div>

        <div className="rewards">
          <RewardBadge
            icon="Coins"
            label="ML Coins"
            value={result.mlCoins}
          />
          <RewardBadge
            icon="Zap"
            label="XP Ganado"
            value={result.xpGained}
          />
        </div>

        <div className="stats">
          <Stat
            label="Respuestas Correctas"
            value={`${result.correctAnswers}/${result.totalQuestions}`}
          />
        </div>

        <button onClick={onClose} className="btn-primary">
          Continuar
        </button>
      </div>
    </Modal>
  );
};
```

---

## Integración con Backend

### API de Mecánicas

```typescript
// features/mechanics/shared/api/mechanicsAPI.ts
export const mechanicsAPI = {
  submit: async (data: MechanicSubmission): Promise<MechanicResult> => {
    const response = await apiClient.post('/mechanics/submit', data);
    return response.data;
  },

  getExercise: async (exerciseId: string): Promise<Exercise> => {
    const response = await apiClient.get(`/mechanics/exercises/${exerciseId}`);
    return response.data;
  },

  getAttempts: async (exerciseId: string): Promise<ExerciseAttempt[]> => {
    const response = await apiClient.get(
      `/mechanics/exercises/${exerciseId}/attempts`
    );
    return response.data;
  },
};
```

### Configuración Dinámica

Las mecánicas obtienen su configuración desde la base de datos:

```sql
-- educational_content.exercises
SELECT
  id,
  module_id,
  title,
  type, -- ExerciseType
  config, -- JSONB con configuración específica
  content, -- JSONB con contenido del ejercicio
  xp_reward,
  ml_coins_reward,
  max_attempts,
  comodines_allowed
FROM educational_content.exercises
WHERE id = $1;
```

**Ejemplo de `config` para Verificador de Fake News:**
```json
{
  "type": "fake_news",
  "difficulty": "medio",
  "estimatedTime": 20,
  "articles": [
    {
      "id": "article-1",
      "headline": "Descubren nueva especie de dinosaurio en la Antártida",
      "content": "...",
      "source": "NoticiasRapidas.com",
      "isFake": true,
      "redFlags": [
        "Fuente no verificable",
        "Sin autor identificado",
        "Lenguaje sensacionalista"
      ]
    }
  ],
  "hints": [
    "Verifica la credibilidad de la fuente",
    "Busca evidencia científica"
  ]
}
```

---

## Ubicación en el Código

**Directorio:** `/src/features/mechanics/module4/`

**Estructura:**
```
module4/
├── VerificadorFakeNews/
│   ├── VerificadorFakeNewsExercise.tsx
│   ├── ArticleViewer.tsx
│   ├── FactCheckDashboard.tsx
│   ├── VerdictPanel.tsx
│   └── types.ts
├── QuizTikTok/
│   ├── QuizTikTokExercise.tsx
│   ├── SwipeGesture.tsx
│   ├── TikTokCard.tsx
│   └── types.ts
├── NavegacionHipertextual/
│   ├── NavegacionHipertextualExercise.tsx
│   ├── DocumentViewer.tsx
│   ├── DocumentMap.tsx
│   ├── Breadcrumbs.tsx
│   └── types.ts
├── AnalisisMemes/
├── InfografiaInteractiva/
├── EmailFormal/
├── ChatLiterario/
├── EnsayoArgumentativo/
└── ResenaCritica/
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
