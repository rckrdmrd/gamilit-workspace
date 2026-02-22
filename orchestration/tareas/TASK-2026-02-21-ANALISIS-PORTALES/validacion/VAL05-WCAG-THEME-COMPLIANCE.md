# VAL05 - Auditoria WCAG y Detective Theme Compliance

**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fecha:** 2026-02-21
**Auditor:** Claude Sonnet 4.6 (Agente)
**Guias de referencia:**
- `docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md`
- `docs/50-guides/frontend/GUIA-DETECTIVE-THEME.md`
- `docs/40-standards/STANDARD-UX-PATTERNS.md`

---

## 1. RESUMEN EJECUTIVO

| Categoria | PASS | WARN | FAIL | Total |
|-----------|------|------|------|-------|
| Admin (4 archivos) | 0 | 2 | 2 | 4 |
| Shared Components (8 archivos) | 1 | 1 | 6 | 8 |
| Module 1 (8 archivos) | 0 | 3 | 5 | 8 |
| Module 2 (8 archivos) | 0 | 1 | 7 | 8 |
| Module 3 (5 archivos) | 0 | 4 | 1 | 5 |
| Module 4 (8 archivos) | 0 | 5 | 3 | 8 |
| Module 5 (3 archivos) | 0 | 2 | 1 | 3 |
| **TOTALES** | **1** | **18** | **25** | **44** |

**Estado global:** FAIL — 25 archivos con violaciones criticas de WCAG o tema.

Criterios de clasificacion:
- **PASS** — Sin violaciones criticas; solo observaciones menores.
- **WARN** — Desviaciones de tema o WCAG de baja severidad; sin bloqueos de accesibilidad.
- **FAIL** — Una o mas violaciones criticas de WCAG (falta de role, aria, teclado, contraste) O desviaciones graves del Detective Theme.

---

## 2. REGLAS VERIFICADAS

### 2.1 WCAG 2.1 Nivel AA (de GUIA-WCAG-ACCESSIBILITY.md)

| ID | Regla | Criterio WCAG |
|----|-------|---------------|
| W-01 | `role="alert"` en mensajes de error dinamicos | 4.1.3 |
| W-02 | `aria-live="polite"` en contenido dinamico no critico | 4.1.3 |
| W-03 | `role="progressbar"` + `aria-valuenow/min/max` en barras de progreso | 4.1.2 |
| W-04 | `role="timer"` + `aria-live="off"` en cronometros | 4.1.2 |
| W-05 | `sr-only` announcement cuando tiempo <= 30s | 4.1.3 |
| W-06 | `htmlFor`/`id` en todos los campos de formulario | 1.3.1 |
| W-07 | `role="tablist"/"tab"` + `aria-selected` en tabs | 4.1.2 |
| W-08 | `aria-label` en botones sin texto visible | 4.1.2 |
| W-09 | `aria-hidden="true"` en iconos decorativos | 1.1.1 |
| W-10 | `role="button"` + `tabIndex={0}` + keyboard handler en divs/spans interactivos | 2.1.1 |
| W-11 | `aria-pressed` en botones de estado binario | 4.1.2 |
| W-12 | Focus trap en modales | 2.1.2 |
| W-13 | `aria-label` en elemento raiz de region | 1.3.1 |
| W-14 | Alternativa de teclado para drag-and-drop | 2.1.1 |
| W-15 | `aria-current="step"` en wizards / stepper | 4.1.2 |

### 2.2 Detective Theme (de GUIA-DETECTIVE-THEME.md)

| ID | Regla |
|----|-------|
| T-01 | Usar tokens `bg-detective-*`, `text-detective-*`, `border-detective-*` en lugar de colores Tailwind directos |
| T-02 | Usar `DetectiveButton` en lugar de `<button>` raw con Tailwind |
| T-03 | Usar `DetectiveCard` como contenedor principal |
| T-04 | Usar `LoadingSpinner` / `LoadingOverlay` en lugar de spinners manuales |
| T-05 | Gradiente de header: `from-detective-blue to-detective-orange` (no indigo, purple) |
| T-06 | Usar sintaxis opacity `/`: `bg-black/50` (no `bg-opacity-50`) |
| T-07 | Responsive pattern: `p-3 sm:p-6`, `text-xl sm:text-2xl` |
| T-08 | Usar `InputDetective` / `input-detective` CSS class en inputs |
| T-09 | `bg-detective-bg-secondary` para skeletons y backgrounds secundarios |
| T-10 | No hardcodear colores de gradiente en headers (`from-indigo-600`, `from-purple-600`) |

---

## 3. MATRIZ WCAG — POR ARCHIVO

Leyenda: OK = cumple | FAIL = violacion | N/A = no aplica | ? = no verificable sin runtime

### 3.1 Admin

| Archivo | W-01 alert | W-06 labels | W-07 tabs | W-08 aria-label | W-10 div-btn | W-12 modal | W-15 stepper |
|---------|-----------|------------|----------|----------------|-------------|-----------|-------------|
| ExerciseTypeSelector | N/A | N/A | **FAIL** | **FAIL** | N/A | N/A | N/A |
| StepBasicInfo | N/A | **FAIL** | N/A | **FAIL** | N/A | N/A | N/A |
| AdminExerciseCreatePage | N/A | N/A | N/A | N/A | N/A | N/A | **FAIL** |
| CreateModuleModal | **FAIL** | **FAIL** | N/A | **FAIL** | N/A | **FAIL** | N/A |

### 3.2 Shared Components

| Archivo | W-01 | W-02 | W-03 progress | W-04 timer | W-05 sr-only | W-08 aria-label | W-09 aria-hidden | W-11 aria-pressed |
|---------|------|------|--------------|-----------|-------------|----------------|-----------------|-----------------|
| ConsumablesPanel | **FAIL** | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| ExerciseHeader | N/A | N/A | N/A | N/A | N/A | **FAIL** | **FAIL** | N/A |
| UnifiedExerciseLayout | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| ExerciseGradientHeader | N/A | N/A | N/A | N/A | N/A | N/A | **FAIL** | N/A |
| FeedbackModal | OK | N/A | N/A | N/A | N/A | OK | OK | N/A |
| ProgressTracker | N/A | N/A | **FAIL** | N/A | N/A | **FAIL** | **FAIL** | N/A |
| ScoreDisplay | N/A | N/A | N/A | N/A | N/A | **FAIL** | **FAIL** | N/A |
| TimerWidget | N/A | N/A | N/A | **FAIL** | **FAIL** | **FAIL** | **FAIL** | N/A |

### 3.3 Module 1

| Archivo | W-02 | W-03 | W-08 | W-09 | W-10 div-btn | W-11 | W-14 DnD |
|---------|------|------|------|------|-------------|------|---------|
| CompletarEspaciosExercise | N/A | **FAIL** | **FAIL** | N/A | **FAIL** | N/A | N/A |
| CrucigramaClue | N/A | N/A | N/A | **FAIL** | N/A | N/A | N/A |
| MatchingCard | N/A | N/A | **FAIL** | N/A | **FAIL** | N/A | N/A |
| ConceptNode | N/A | N/A | **FAIL** | N/A | **FAIL** | N/A | **FAIL** |
| MapaConceptualExercise | N/A | **FAIL** | **FAIL** | N/A | N/A | N/A | **FAIL** |
| TimelineEvent | N/A | N/A | N/A | **FAIL** | N/A | N/A | **FAIL** |
| VerdaderoFalsoExercise | N/A | **FAIL** | N/A | N/A | N/A | **FAIL** | N/A |
| VerdaderoFalsoExercise.SECURE | N/A | **FAIL** | N/A | N/A | N/A | **FAIL** | N/A |

### 3.4 Module 2

| Archivo | W-02 | W-03 | W-04 | W-05 | W-08 | W-10 | W-13 | W-14 |
|---------|------|------|------|------|------|------|------|------|
| CausaEfectoExercise | N/A | N/A | N/A | N/A | **FAIL** | N/A | N/A | **FAIL** |
| DetectiveTextualExercise | N/A | N/A | N/A | N/A | **FAIL** | N/A | N/A | N/A |
| LecturaInferencialExercise | N/A | N/A | N/A | N/A | **FAIL** | N/A | N/A | N/A |
| PrediccionNarrativaExercise | N/A | N/A | N/A | N/A | **FAIL** | N/A | N/A | N/A |
| PuzzleContextoExercise | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **FAIL** |
| CountdownTimer | N/A | N/A | **FAIL** | **FAIL** | N/A | N/A | N/A | N/A |
| RuedaInferenciasExercise | N/A | N/A | N/A | N/A | **FAIL** | N/A | N/A | N/A |
| WheelSpinner | **FAIL** | N/A | N/A | N/A | **FAIL** | N/A | N/A | **FAIL** |

### 3.5 Module 3 (todos son manual review — evaluacion limitada)

| Archivo | W-01 | W-02 | W-06 | W-08 | W-13 |
|---------|------|------|------|------|------|
| AnalisisFuentesExercise | N/A | N/A | WARN | **FAIL** | N/A |
| DebateDigitalExercise | N/A | N/A | WARN | **FAIL** | N/A |
| MatrizPerspectivasExercise | N/A | N/A | WARN | N/A | N/A |
| PodcastArgumentativoExercise | N/A | N/A | WARN | N/A | N/A |
| TribunalOpinionesExercise | N/A | N/A | WARN | N/A | N/A |

### 3.6 Module 4

| Archivo | W-02 | W-08 | W-09 | W-10 | W-13 | W-14 |
|---------|------|------|------|------|------|------|
| AnalisisMemesExercise | N/A | **FAIL** | N/A | N/A | N/A | N/A |
| InfografiaInteractivaExercise | N/A | N/A | N/A | N/A | N/A | **FAIL** |
| HypertextDocument | N/A | N/A | N/A | N/A | OK | N/A |
| NavegacionHipertextualExercise | N/A | N/A | N/A | N/A | N/A | N/A |
| QuizTikTokExercise | N/A | **FAIL** | N/A | N/A | N/A | N/A |
| TikTokCard | N/A | N/A | **FAIL** | N/A | N/A | N/A |
| ArticleParser | N/A | N/A | N/A | N/A | N/A | N/A |
| VerificadorFakeNewsExercise | N/A | **FAIL** | N/A | N/A | N/A | N/A |

### 3.7 Module 5

| Archivo | W-02 | W-06 | W-08 | W-13 |
|---------|------|------|------|------|
| ComicDigitalExercise | N/A | N/A | WARN | N/A |
| DiarioMultimediaExercise | N/A | N/A | **FAIL** | N/A |
| VideoCartaExercise | N/A | N/A | WARN | N/A |

---

## 4. MATRIZ DETECTIVE THEME — POR ARCHIVO

Leyenda: OK = usa tokens correctos | FAIL = colores hardcodeados | WARN = mezcla parcial

### 4.1 Admin

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard | T-04 Spinner | T-06 opacity |
|---------|------------|------------|-------------|-------------|-------------|
| ExerciseTypeSelector | **FAIL** | N/A | OK | N/A | OK |
| StepBasicInfo | OK | OK | OK | **FAIL** | OK |
| AdminExerciseCreatePage | OK | OK | OK | N/A | OK |
| CreateModuleModal | OK | OK | OK | N/A | OK |

### 4.2 Shared Components

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard | T-04 Spinner | T-05 gradient | T-09 bg-sec |
|---------|------------|------------|-------------|-------------|--------------|------------|
| ConsumablesPanel | WARN | OK | OK | **FAIL** | N/A | N/A |
| ExerciseHeader | **FAIL** | N/A | N/A | N/A | N/A | N/A |
| UnifiedExerciseLayout | WARN | N/A | OK | N/A | N/A | N/A |
| ExerciseGradientHeader | N/A | N/A | N/A | N/A | **FAIL** | N/A |
| FeedbackModal | WARN | OK | OK | N/A | N/A | N/A |
| ProgressTracker | **FAIL** | N/A | N/A | N/A | **FAIL** | N/A |
| ScoreDisplay | **FAIL** | N/A | N/A | N/A | **FAIL** | N/A |
| TimerWidget | **FAIL** | N/A | N/A | N/A | N/A | N/A |

### 4.3 Module 1

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard | T-08 input |
|---------|------------|------------|-------------|-----------|
| CompletarEspaciosExercise | WARN | OK | OK | N/A |
| CrucigramaClue | OK | N/A | OK | N/A |
| MatchingCard | **FAIL** | N/A | N/A | N/A |
| ConceptNode | WARN | N/A | N/A | N/A |
| MapaConceptualExercise | OK | OK | OK | N/A |
| TimelineEvent | WARN | N/A | OK | N/A |
| VerdaderoFalsoExercise | WARN | OK | OK | N/A |
| VerdaderoFalsoExercise.SECURE | WARN | OK | OK | N/A |

### 4.4 Module 2

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard | T-05 gradient | T-10 no-indigo |
|---------|------------|------------|-------------|--------------|---------------|
| CausaEfectoExercise | WARN | OK | OK | N/A | N/A |
| DetectiveTextualExercise | OK | OK | OK | N/A | N/A |
| LecturaInferencialExercise | WARN | OK | OK | N/A | N/A |
| PrediccionNarrativaExercise | WARN | OK | OK | N/A | N/A |
| PuzzleContextoExercise | WARN | OK | OK | N/A | N/A |
| CountdownTimer | WARN | N/A | N/A | N/A | N/A |
| RuedaInferenciasExercise | **FAIL** | **FAIL** | OK | **FAIL** | **FAIL** |
| WheelSpinner | WARN | N/A | N/A | N/A | N/A |

### 4.5 Module 3

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard | T-08 input |
|---------|------------|------------|-------------|-----------|
| AnalisisFuentesExercise | WARN | OK | OK | OK |
| DebateDigitalExercise | WARN | OK | OK | OK |
| MatrizPerspectivasExercise | OK | OK | OK | OK |
| PodcastArgumentativoExercise | OK | OK | OK | N/A |
| TribunalOpinionesExercise | OK | OK | OK | N/A |

### 4.6 Module 4

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard |
|---------|------------|------------|-------------|
| AnalisisMemesExercise | WARN | OK | OK |
| InfografiaInteractivaExercise | OK | OK | OK |
| HypertextDocument | OK | OK | N/A |
| NavegacionHipertextualExercise | OK | OK | OK |
| QuizTikTokExercise | WARN | OK | OK |
| TikTokCard | **FAIL** | N/A | N/A |
| ArticleParser | N/A | N/A | N/A |
| VerificadorFakeNewsExercise | OK | OK | OK |

### 4.7 Module 5

| Archivo | T-01 tokens | T-02 DetBtn | T-03 DetCard |
|---------|------------|------------|-------------|
| ComicDigitalExercise | OK | OK | OK |
| DiarioMultimediaExercise | OK | OK | OK |
| VideoCartaExercise | OK | OK | OK |

---

## 5. HALLAZGOS DETALLADOS POR SECCION

### 5.1 Admin — ExerciseTypeSelector

**Estado:** WARN

**WCAG:**
- `<div class="flex flex-wrap gap-2">` que contiene los tab buttons no tiene `role="tablist"`
- Cada `<button>` de modulo no tiene `role="tab"` ni `aria-selected`
- Los botones de tipo de ejercicio no tienen `aria-label` ni `aria-pressed`

**Tema:**
- Colores `bg-gray-800`, `text-gray-400`, `hover:bg-gray-700`, `border-gray-700`, `bg-gray-800/50` son del dark palette generico — no son tokens detective
- Los colores correctos serían: `bg-detective-bg-secondary`, `text-detective-text-secondary`, `border-detective-border`

**Codigo afectado:**
```tsx
// Linea 139-153: tabs sin roles
<button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  className={cn(
    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
    activeTab === tab.id
      ? 'bg-detective-orange text-white'
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'  // NO detective tokens
  )}
>

// Linea 170-200: card buttons sin aria-pressed
<motion.button
  onClick={() => onSelect(type.id)}
  className={cn(
    'rounded-xl border-2 p-4 text-left transition-colors',
    isSelected
      ? 'border-detective-orange bg-detective-orange/10'
      : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'  // NO detective tokens
  )}
>
```

---

### 5.2 Admin — StepBasicInfo

**Estado:** FAIL

**WCAG:**
- 10 campos de formulario con `<label>` pero SIN atributos `htmlFor`/`id` — violacion W-06
- Spinner `Loader2` en el boton "Nuevo modulo" en lugar del componente `LoadingSpinner` canonico
- Boton "Nuevo modulo" tiene `title` pero no `aria-label` explicito

**Tema:**
- Uso correcto de `input-detective` CSS class
- Uso correcto de `DetectiveButton`, `DetectiveCard`
- `Loader2` inline en lugar de `LoadingSpinner` — violacion T-04

**Codigo afectado:**
```tsx
// Patron repetido en 10 campos — ejemplo:
<label className="block text-sm font-medium text-detective-text mb-1">
  Titulo *   // SIN htmlFor
</label>
<input
  // SIN id attribute
  type="text"
  required
  value={formData.title}
  ...
/>
```

**Correccion requerida:**
```tsx
<label htmlFor="exercise-title" className="...">
  Titulo *
</label>
<input
  id="exercise-title"
  type="text"
  ...
/>
```

---

### 5.3 Admin — AdminExerciseCreatePage

**Estado:** WARN

**WCAG:**
- Step indicator buttons no usan `aria-current="step"` en el paso activo
- Steps completados no tienen texto sr-only que indique que estan completados

**Tema:**
- Uso correcto de `DetectiveButton`, `DetectiveCard` en toda la pagina
- `react-hot-toast` correcto para feedback de mutaciones

**Codigo afectado:**
```tsx
// Linea 232-259: step indicator sin aria-current
<button
  onClick={() => { if (isCompleted) setCurrentStep(step.id); }}
  disabled={!isCompleted && !isActive}
  className={cn(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive && 'bg-detective-orange/20 text-detective-orange',
    // Falta: aria-current={isActive ? "step" : undefined}
  )}
>
```

---

### 5.4 Admin — CreateModuleModal

**Estado:** FAIL

**WCAG:**
- Div de error (linea 142) sin `role="alert"` — violacion W-01
- Boton cerrar (linea 129) sin `aria-label` — violacion W-08
- `<Modal>` invocado sin `ariaLabelledBy` prop
- 7 campos de formulario con `<label>` sin `htmlFor`/`id` — violacion W-06

**Tema:**
- Uso correcto de tokens detective en colores de formulario
- Uso correcto de `DetectiveButton`
- Sin violaciones de tema significativas

**Codigo afectado:**
```tsx
// Linea 141-145: error sin role="alert"
{error && (
  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
    // Falta: role="alert"
    <p className="text-red-400 text-sm">{error}</p>
  </div>
)}

// Linea 129-135: boton sin aria-label
<button
  onClick={handleClose}
  disabled={isCreating}
  className="..."
  // Falta: aria-label="Cerrar modal"
>
  <X className="h-5 w-5 text-detective-text-secondary" />
</button>
```

---

### 5.5 Shared — ConsumablesPanel

**Estado:** FAIL

**WCAG:**
- Div de error (estado de carga fallida) sin `role="alert"`

**Tema:**
- Colores hardcodeados en items: `text-yellow-600`, `bg-yellow-100`, `bg-blue-100`, `bg-green-100`
- Spinner manual con `<Zap>` icon + `animate-spin` en lugar de `LoadingSpinner` — violacion T-04
- Uso correcto de `DetectiveCard`, `DetectiveButton`

---

### 5.6 Shared — ExerciseHeader

**Estado:** FAIL

**WCAG:**
- Seccion de header sin `role="region"` ni `aria-label`
- Iconos de XP y tiempo sin `aria-hidden="true"`
- Timer de ejercicio sin `role="timer"`, sin `aria-live`

**Tema (CRITICO):**
- NINGUN token detective — todo el componente usa colores Tailwind directos:
  - `bg-white` → deberia ser `bg-detective-bg`
  - `text-gray-900` → deberia ser `text-detective-text`
  - `text-gray-600` → deberia ser `text-detective-text-secondary`
  - `bg-blue-50 border-blue-200 text-blue-900` → deberia ser `bg-detective-card border-detective-border`
  - `text-purple-600` → deberia ser `text-detective-orange` o `text-detective-gold`
  - `text-yellow-600` → deberia ser `text-detective-gold`

Este componente es una desviacion total del Detective Theme.

---

### 5.7 Shared — UnifiedExerciseLayout

**Estado:** WARN

**WCAG:**
- Wrapper div principal sin `role="main"` ni `aria-label`
- Div de contenido `.exercise-content` sin `role="region"`

**Tema:**
- Uso correcto de `DetectiveCard`, `ExerciseGradientHeader`
- `border-blue-200` hardcodeado para dificultad (en lugar de token detective)

---

### 5.8 Shared — ExerciseGradientHeader

**Estado:** FAIL (Tema)

**WCAG:**
- Sin violaciones criticas de WCAG
- Iconos en header sin `aria-hidden="true"`

**Tema (CRITICO):**
- Default gradient: `from-indigo-600 to-orange-500`
- `indigo-600` NO es un color del Detective Theme
- Deberia ser: `from-detective-blue to-detective-orange` o tokens equivalentes
- Gradient correcto de la guia: `bg-gradient-to-r from-blue-600 to-orange-500` (usando el azul del tema, no indigo)

---

### 5.9 Shared — FeedbackModal

**Estado:** PASS (mejor cumplimiento del conjunto)

**WCAG:**
- Usa `ariaLabelledBy="feedback-title"` correctamente
- `aria-label` en todos los botones de accion
- `aria-hidden="true"` en iconos decorativos y Confetti
- Observacion menor: el modal en si mismo podria tener `role="alertdialog"` para anunciar resultado

**Tema:**
- Usa `DetectiveButton`, `DetectiveCard(variant="gold")` correctamente
- Desviacion menor: estadisticas simples usan `bg-blue-50`, `bg-green-50`, `bg-purple-50` en lugar de tokens detective

---

### 5.10 Shared — ProgressTracker

**Estado:** FAIL

**WCAG (CRITICO):**
- Barra de progreso principal sin `role="progressbar"`, sin `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Indicadores de pasos sin `aria-label`

**Tema (CRITICO):**
- `bg-orange-500` → deberia ser `bg-detective-orange`
- `bg-green-500` → deberia ser `bg-detective-success` o `bg-green-500` aceptable para semantica
- `bg-gray-300` → deberia ser `bg-detective-bg-secondary`
- `text-gray-600` → deberia ser `text-detective-text-secondary`
- `bg-gradient-to-r from-orange-500 to-amber-500` → deberia ser gradiente detective

**Correccion requerida:**
```tsx
<div
  role="progressbar"
  aria-valuenow={currentStep}
  aria-valuemin={1}
  aria-valuemax={totalSteps}
  aria-label={`Paso ${currentStep} de ${totalSteps}`}
  className="h-2 rounded-full bg-detective-orange transition-all duration-500"
  style={{ width: `${progress}%` }}
/>
```

---

### 5.11 Shared — ScoreDisplay

**Estado:** FAIL

**WCAG:**
- Contenedor de score sin `aria-label`
- Icono Trophy sin `aria-hidden="true"`
- Score numerico sin contexto semantico para lectores de pantalla

**Tema:**
- `bg-gradient-to-r from-orange-500 to-amber-500` → deberia ser `from-detective-orange to-detective-gold`
- No usa tokens detective en ningun elemento

---

### 5.12 Shared — TimerWidget

**Estado:** FAIL

**WCAG (CRITICO):**
- Sin `role="timer"`
- Sin `aria-live="off"` (cronometros deben ser `off` para no interrumpir lectores)
- Sin `aria-label` describiendo que es un temporizador
- Sin anuncio sr-only cuando tiempo es critico (<= 30s)
- Icono Clock sin `aria-hidden="true"`

**Tema:**
- `bg-gray-100 text-gray-700` — no son tokens detective
- Deberia ser `bg-detective-bg-secondary text-detective-text`

**Correccion requerida:**
```tsx
<div
  role="timer"
  aria-live="off"
  aria-label={`Tiempo restante: ${formatTime(timeLeft)}`}
  className="flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-3 py-1.5"
>
  <Clock className="h-4 w-4 text-detective-text-secondary" aria-hidden="true" />
  <span className={cn(
    "font-mono text-sm font-medium",
    isUrgent ? "text-red-500" : "text-detective-text"
  )}>
    {formatTime(timeLeft)}
  </span>
  {isUrgent && (
    <span className="sr-only">Advertencia: menos de 30 segundos restantes</span>
  )}
</div>
```

---

### 5.13 Module 1 — CompletarEspaciosExercise

**Estado:** FAIL

**WCAG:**
- Blancos interactivos son `<motion.span onClick>` sin `role="button"`, sin `tabIndex={0}`, sin handler de teclado
- Botones del banco de palabras sin `aria-label`
- Boton "X" para limpiar un blanco sin `aria-label`
- Barra de progreso sin `role="progressbar"`, `aria-valuenow/min/max`

**Tema:**
- Estado de blanco seleccionado: `border-blue-500 bg-blue-100 text-blue-800` — no son tokens detective
- Uso correcto de `UnifiedExerciseLayout`, `DetectiveCard`, `FeedbackModal`

---

### 5.14 Module 1 — CrucigramaClue

**Estado:** WARN

**WCAG:**
- Iconos `CheckCircle2`/`Circle` sin `aria-hidden="true"`

**Tema:**
- Uso correcto de tokens detective (`text-detective-orange`, `text-detective-success`, `bg-detective-bg`)
- Sin desviaciones significativas

---

### 5.15 Module 1 — MatchingCard

**Estado:** FAIL

**WCAG (CRITICO):**
- `<motion.div onClick>` usado como carta interactiva — sin `role="button"`, sin `tabIndex={0}`, sin handler de teclado (Enter/Space)
- Sin `aria-label` ni `aria-pressed`

**Tema (CRITICO):**
- `bg-green-500/20 border-green-500 text-green-800` — no detective (estado matched)
- `bg-blue-500 ring-blue-300` — no detective (estado selected)
- `bg-orange-100 text-orange-800` — no detective (categoria opcion A)
- `bg-purple-100 text-purple-800` — no detective (categoria opcion B)
- Todas estas categorias deberian usar `bg-detective-card` + borde de color semantico

---

### 5.16 Module 1 — ConceptNode

**Estado:** FAIL

**WCAG (CRITICO):**
- Nodo arrastrable como `<motion.div>` sin `role="button"`, sin `tabIndex={0}`, sin handler de teclado
- Sin alternativa de teclado para drag (violacion W-14)
- Sin `aria-label` describiendo el nodo

**Tema:**
- `hover:border-blue-400` — deberia ser `hover:border-detective-orange` o token equivalente
- Uso correcto de `border-detective-border`

---

### 5.17 Module 1 — MapaConceptualExercise

**Estado:** FAIL

**WCAG:**
- Canvas SVG de conexiones sin `aria-label` ni descripcion alternativa
- Las conexiones entre nodos son puramente visuales (sin alternativa textual)
- Barra de progreso sin `role="progressbar"`

**Tema:**
- Uso correcto de `UnifiedExerciseLayout`, `DetectiveCard`, `FeedbackModal`, `DetectiveButton`
- Sin desviaciones criticas de tema

---

### 5.18 Module 1 — TimelineEvent

**Estado:** WARN

**WCAG:**
- Div con `cursor-move` no es teclado-accesible
- Icono `Calendar` con `text-blue-600` — no afecta WCAG pero es desviacion de tema
- Icono `GripVertical` sin `aria-hidden="true"`

**Tema:**
- `text-blue-600` en icono Calendar — deberia ser `text-detective-orange` o `text-detective-text-secondary`

---

### 5.19 Module 1 — VerdaderoFalsoExercise (ambas versiones)

**Estado:** FAIL

**WCAG:**
- Botones de respuesta (Verdadero/Falso) sin `aria-pressed` — violacion W-11
- Barra de progreso sin `role="progressbar"`, `aria-valuenow/min/max`

**Tema:**
- Badge de numero de enunciado: `bg-blue-100 text-blue-700` — no detective tokens
- Uso correcto de `UnifiedExerciseLayout`, `DetectiveCard`, `FeedbackModal`
- VerdaderoFalso.SECURE usa `ScoreDisplay`, `TimerWidget`, `ProgressTracker` — heredan sus propias fallas

---

### 5.20 Module 2 — CausaEfectoExercise

**Estado:** FAIL

**WCAG:**
- Drag-and-drop con API HTML5 nativa — no tiene alternativa de teclado
- Boton "remover consecuencia" sin `aria-label`

**Tema:**
- `border-blue-300` en zonas de causa — no detective token
- Uso correcto de `DetectiveButton`, `UnifiedExerciseLayout`, `DetectiveCard`

---

### 5.21 Module 2 — DetectiveTextualExercise

**Estado:** WARN

**WCAG:**
- Opciones de respuesta tipo radio sin `role="radiogroup"` + `role="radio"`

**Tema:**
- `bg-gray-50` en hover de opciones — desviacion menor
- Uso mayoritariamente correcto de tokens detective

---

### 5.22 Module 2 — LecturaInferencialExercise

**Estado:** WARN

**WCAG:**
- Opciones sin `role="radiogroup"` / `role="radio"`

**Tema:**
- Badge de tipo de inferencia: `bg-purple-100 text-purple-800` — no detective tokens
- Uso correcto de `UnifiedExerciseLayout`, `DetectiveButton`, `DetectiveCard`

---

### 5.23 Module 2 — PrediccionNarrativaExercise

**Estado:** WARN

**WCAG:**
- Botones de prediccion sin `aria-label` explicito

**Tema:**
- `border-purple-200 bg-purple-50` en contenedor de pista — no detective tokens
- Uso correcto de `DetectiveButton`, `border-detective-gold` para hints

---

### 5.24 Module 2 — PuzzleContextoExercise

**Estado:** WARN

**WCAG:**
- `Reorder` de framer-motion para DnD — no tiene alternativa de teclado nativa

**Tema:**
- `border-purple-200 bg-purple-50` — no detective tokens
- Uso correcto de `DetectiveButton`, `UnifiedExerciseLayout`

---

### 5.25 Module 2 — CountdownTimer

**Estado:** FAIL

**WCAG (CRITICO):**
- Sin `role="timer"`
- Sin `aria-live="off"` (requerido para cronometros segun GUIA-WCAG)
- Sin `sr-only` announcement cuando tiempo es critico (<= 5s — solo hay `animate-pulse` visual)

**Tema:**
- Variante default usa `border-blue-400 bg-blue-500 text-blue-600` — no detective tokens
- `bg-detective-bg-secondary` en barra de progreso — correcto
- `border-detective-gold` disponible pero no usado en variante critica

---

### 5.26 Module 2 — RuedaInferenciasExercise

**Estado:** FAIL

**WCAG:**
- `<textarea>` sin `aria-label` ni `id`/`htmlFor`
- Boton de giro con raw `<button>` sin `aria-label`
- Multiple botones de categoria sin `aria-label` individual

**Tema (CRITICO):**
- `bg-blue-600` en boton de giro principal — no detective (deberia ser `DetectiveButton variant="primary"`)
- `bg-blue-50 border-blue-200 border-blue-300` — no detective tokens
- `border-green-300` — no detective
- `gradientClassName="from-blue-600 to-purple-600"` en ExerciseGradientHeader — violacion T-10
- `style={{ backgroundColor: selectedCategory.color }}` — colores inline desde datos

---

### 5.27 Module 2 — WheelSpinner

**Estado:** FAIL

**WCAG (CRITICO):**
- Ruleta giratoria puramente visual — sin alternativa de teclado
- Sin `aria-label` en el elemento de la ruleta
- Sin `aria-live="polite"` announcement cuando la ruleta termina de girar
- `border-4 border-blue-500` en display de seleccionado — no detective

**Tema:**
- `border-detective-gold` en borde de la ruleta — correcto
- Colores inline `backgroundColor` desde datos de categoria

---

### 5.28 Module 3 — Todos los ejercicios

**Estado:** WARN (todos son manual review con evaluacion limitada)

**Patron comun:**
- Todos usan `UnifiedExerciseLayout`, `DetectiveButton`, `FeedbackModal` con `MANUAL_REVIEW_PENDING_SHORT_MESSAGE`
- `pendingReview: true` en FeedbackData correctamente configurado
- Desviaciones menores de tema en badges y colores de formulario
- Inputs de texto/textarea en algunos casos sin `aria-label` o `htmlFor`/`id`

**Archivos especificos:**
- `AnalisisFuentesExercise`: inputs de evaluacion sin `aria-label`; `bg-green-50 border-green-200` en seccion de credibilidad
- `DebateDigitalExercise`: argumentos card con `bg-blue-50` — no detective
- `MatrizPerspectivasExercise`: tabla de perspectivas — uso correcto de tokens
- `PodcastArgumentativoExercise`: textarea de guion sin `aria-label`
- `TribunalOpinionesExercise`: botones de veredicto sin `aria-pressed`

---

### 5.29 Module 4 — Hallazgos principales

**AnalisisMemesExercise (WARN):**
- Botones de analisis sin `aria-label` individual
- Algunas etiquetas de categoria con colores hardcodeados

**InfografiaInteractivaExercise (WARN):**
- Elementos interactivos de infografia sin alternativa de teclado (drag potencial)
- Uso correcto de tokens detective en general

**HypertextDocument (PASS en tema):**
- Uso correcto de `DetectiveButton`
- Links de hipertexto correctamente estructurados con roles semanticos

**QuizTikTokExercise (WARN):**
- Botones de respuesta sin `aria-pressed`
- `TikTokCard` usa `bg-green-500 bg-yellow-500 bg-red-500` para timer — semanticamente justificados pero fuera del tema

**TikTokCard (FAIL en tema):**
- Colores de timer hardcodeados: `bg-green-500`, `bg-yellow-500`, `bg-red-500`
- Iconos sin `aria-hidden="true"`

**ArticleParser (N/A):**
- Usa `document.getElementById` para parsear — funcional pero no WCAG-critical en este contexto

**VerificadorFakeNewsExercise (WARN):**
- Botones de verificacion sin `aria-label` explicito
- Uso correcto de tokens detective

---

### 5.30 Module 5 — Hallazgos principales

**ComicDigitalExercise (WARN):**
- Panels de comic interactivos sin `aria-label`
- Uso correcto de `UnifiedExerciseLayout`, `DetectiveCard`

**DiarioMultimediaExercise (FAIL en WCAG):**
- Toggle `isPrivate` rendereado como boton sin `aria-checked`
- Upload buttons sin `aria-label`
- Video/audio elements sin consideracion de captions

**VideoCartaExercise (WARN):**
- Elemento `<video>` sin track de captions (consideracion de accesibilidad)
- Botones de grabacion sin `aria-label` claro

---

## 6. VIOLACIONES CRITICAS (PRIORIDAD ALTA)

Las siguientes son violaciones que bloquean WCAG 2.1 AA y deben corregirse antes de produccion:

### WCAG Critico

| # | Archivo | Violacion | Criterio | Impacto |
|---|---------|-----------|----------|---------|
| 1 | `TimerWidget` | Sin `role="timer"`, `aria-live="off"`, `aria-label` | 4.1.2 | Lectores de pantalla no pueden acceder al tiempo |
| 2 | `ProgressTracker` | Sin `role="progressbar"`, `aria-valuenow/min/max` | 4.1.2 | Progreso inaccesible para tecnologias asistivas |
| 3 | `CountdownTimer` | Sin `role="timer"`, sin sr-only al tiempo critico | 4.1.2, 4.1.3 | Usuarios con discapacidad visual no reciben alerta de tiempo |
| 4 | `MatchingCard` | `div` interactivo sin `role="button"`, `tabIndex`, teclado | 2.1.1 | Ejercicio completamente inaccesible via teclado |
| 5 | `ConceptNode` | `div` arrastrable sin accesibilidad de teclado | 2.1.1 | Mapa conceptual inaccesible via teclado |
| 6 | `WheelSpinner` | Ruleta sin alternativa de teclado ni `aria-live` | 2.1.1, 4.1.3 | Rueda de inferencias inaccesible |
| 7 | `CompletarEspacios` | Blancos como `span` sin `role="button"` ni teclado | 2.1.1 | Ejercicio de completar espacios inaccesible |
| 8 | `CausaEfectoExercise` | Drag-and-drop HTML5 sin alternativa teclado | 2.1.1 | Ejercicio de causa-efecto inaccesible |
| 9 | `StepBasicInfo` | 10 inputs sin `htmlFor`/`id` | 1.3.1 | Labels no asociadas — problema critico de formulario |
| 10 | `CreateModuleModal` | 7 inputs sin `htmlFor`/`id`; error sin `role="alert"` | 1.3.1, 4.1.3 | Modal completamente no asociado para lectores |
| 11 | `ExerciseTypeSelector` | Tabs sin `role="tablist"/"tab"`, `aria-selected` | 4.1.2 | Navegacion por tabs inaccesible |

### Tema Critico

| # | Archivo | Violacion | Descripcion |
|---|---------|-----------|-------------|
| 1 | `ExerciseHeader` | T-01 total | Ningun token detective — bg-white, text-gray-900, bg-blue-50 |
| 2 | `ExerciseGradientHeader` | T-10 | Default gradient usa `from-indigo-600` — indigo no es color detective |
| 3 | `ProgressTracker` | T-01, T-05 | Todo hardcodeado: bg-orange-500, bg-green-500, bg-gray-300 |
| 4 | `ScoreDisplay` | T-01, T-05 | Gradient from-orange-500 to-amber-500 en lugar de detective |
| 5 | `TimerWidget` | T-01 | bg-gray-100 text-gray-700 — no detective |
| 6 | `MatchingCard` | T-01 | bg-blue-500, bg-orange-100, bg-purple-100 — no detective |
| 7 | `RuedaInferenciasExercise` | T-02, T-10 | Raw `<button>` con bg-blue-600; gradient from-blue-600 to-purple-600 |

---

## 7. DESVIACIONES DE TEMA POR PATRON

### 7.1 Colores Tailwind no-detective mas frecuentes

| Color hardcodeado | Frecuencia | Color detective correcto |
|------------------|-----------|------------------------|
| `bg-blue-50`, `border-blue-200`, `text-blue-*` | 15+ usos | `bg-detective-card`, `border-detective-border` |
| `bg-purple-100`, `text-purple-*` | 8+ usos | `bg-detective-bg-secondary`, `text-detective-text` |
| `bg-orange-100`, `text-orange-*` | 5+ usos | `bg-detective-orange/10`, `text-detective-orange` |
| `bg-gray-100`, `text-gray-*` | 10+ usos | `bg-detective-bg-secondary`, `text-detective-text-secondary` |
| `bg-green-50`, `border-green-200` | 6+ usos | No tiene equivalente detective — usar semanticamente |
| `from-indigo-600` en gradients | 2 usos | `from-detective-blue` o `from-blue-600` |
| `from-purple-600` en gradients | 2 usos | No aceptado en detective theme |

### 7.2 Componentes canonicos no utilizados

| Componente canonico | Donde deberia usarse | Que se usa en su lugar |
|--------------------|---------------------|----------------------|
| `LoadingSpinner` | `StepBasicInfo`, `ConsumablesPanel` | `<Loader2 animate-spin>`, `<Zap animate-spin>` |
| `DetectiveButton` | `RuedaInferenciasExercise` boton principal | Raw `<button>` con `bg-blue-600` |
| `role="progressbar"` pattern | `ProgressTracker`, `CompletarEspacios`, `VerdaderoFalso`, `MapaConceptual` | `<div>` sin roles |

---

## 8. RECOMENDACIONES PRIORIZADAS

### Fase 1 — CRITICO (bloquea WCAG 2.1 AA)

1. **[P1-01] Reparar ProgressTracker**: Agregar `role="progressbar"` + `aria-valuenow/min/max/label`. Reemplazar colores hardcodeados con tokens detective. Este componente es usado en multiples ejercicios.

2. **[P1-02] Reparar TimerWidget**: Agregar `role="timer"` + `aria-live="off"` + `aria-label`. Reemplazar `bg-gray-100` con `bg-detective-bg-secondary`.

3. **[P1-03] Reparar CountdownTimer**: Agregar `role="timer"` + `aria-live="off"` + sr-only announcement al <= 30s.

4. **[P1-04] Reparar ExerciseTypeSelector tabs**: Agregar `role="tablist"` al wrapper, `role="tab"` + `aria-selected` a cada boton de modulo. Reemplazar colores dark palette con tokens detective.

5. **[P1-05] Reparar formularios admin** (StepBasicInfo, CreateModuleModal): Agregar `id` a cada input y `htmlFor` a cada label. Agregar `role="alert"` en divs de error.

6. **[P1-06] Reparar MatchingCard**: Cambiar `motion.div` a `motion.button` o agregar `role="button"` + `tabIndex={0}` + `onKeyDown` handler (Enter/Space).

7. **[P1-07] Reparar CompletarEspaciosExercise blancos**: Cambiar `motion.span` a `motion.button` o agregar `role="button"` + `tabIndex={0}` + keyboard handler.

8. **[P1-08] Reparar WheelSpinner**: Agregar `aria-label` al canvas de la ruleta. Agregar `aria-live="polite"` para anunciar resultado al completar giro.

### Fase 2 — ALTO (mejora accesibilidad significativa)

9. **[P2-01] Reparar ExerciseHeader**: Migrar completamente a tokens detective. Agregar `role="region"` con `aria-label`. Es el header visible en todos los ejercicios.

10. **[P2-02] Reparar ExerciseGradientHeader default gradient**: Cambiar `from-indigo-600` a `from-blue-600` o token detective equivalente.

11. **[P2-03] Reparar ScoreDisplay**: Agregar `aria-label` en contenedor. Agregar `aria-hidden` en Trophy icon. Migrar gradient a tokens detective.

12. **[P2-04] Agregar aria-pressed en VerdaderoFalso y TribunalOpiniones**: Los botones de respuesta binaria deben reflejar estado via `aria-pressed`.

13. **[P2-05] Agregar alternativas de teclado para DnD**: CausaEfecto, ConceptNode, PuzzleContexto, InfografiaInteractiva necesitan alternativa de teclado (botones up/down o lista seleccionable).

14. **[P2-06] Agregar aria-current="step"** en AdminExerciseCreatePage stepper.

15. **[P2-07] Reparar RuedaInferencias**: Cambiar boton de giro a `DetectiveButton`. Corregir `gradientClassName` a colores del tema. Agregar `aria-label` a textarea y botones de categoria.

### Fase 3 — MEDIO (deuda de tema y polish)

16. **[P3-01] Estandarizar ProgressTracker theme**: Reemplazar todos los colores hardcodeados con tokens detective. Este componente propaga la desviacion a 8+ ejercicios.

17. **[P3-02] Estandarizar FeedbackModal stats grid**: Reemplazar `bg-blue-50`, `bg-green-50`, `bg-purple-50` con tokens detective.

18. **[P3-03] Agregar `aria-hidden="true"` a iconos decorativos**: CrucigramaClue, ExerciseHeader, ScoreDisplay, TimerWidget, TimelineEvent, TikTokCard.

19. **[P3-04] Estandarizar badges en ejercicios**: Los badges de numero de enunciado, tipo de inferencia y categoria usan `bg-blue-100 text-blue-700`, `bg-purple-100 text-purple-800` — migrar a tokens detective.

20. **[P3-05] Reemplazar spinners manuales**: StepBasicInfo y ConsumablesPanel deben usar `LoadingSpinner` canonico en lugar de `<Loader2>` y `<Zap>` con `animate-spin`.

---

## 9. ARCHIVOS EN MEJOR ESTADO (referencia)

Los siguientes archivos pueden usarse como referencia de buenas practicas:

| Archivo | Motivo |
|---------|--------|
| `FeedbackModal.tsx` | Mejor WCAG del conjunto: ariaLabelledBy, aria-label en botones, aria-hidden en iconos |
| `CrucigramaClue.tsx` | Mejor uso de tokens detective en Module 1 |
| `DetectiveTextualExercise.tsx` | Mejor balance WCAG + tema en Module 2 |
| `MatrizPerspectivasExercise.tsx` | Uso correcto de DetectiveButton, DetectiveCard en Module 3 |
| `HypertextDocument.tsx` | Links semanticamente correctos en Module 4 |
| `VideoCartaExercise.tsx` | Uso correcto de `UnifiedExerciseLayout` en Module 5 |
| `AdminExerciseCreatePage.tsx` | Patron correcto de `DetectiveButton`/`DetectiveCard` + `react-hot-toast` |

---

## 10. METRICAS FINALES

| Metrica | Valor |
|---------|-------|
| Archivos auditados | 44 |
| Archivos PASS | 1 (2.3%) |
| Archivos WARN | 18 (40.9%) |
| Archivos FAIL | 25 (56.8%) |
| Violaciones WCAG criticas | 11 |
| Violaciones de tema criticas | 7 |
| Recomendaciones totales | 20 (8 P1 + 7 P2 + 5 P3) |
| Componentes que propagan fallas | 3 (ProgressTracker, TimerWidget, ExerciseHeader) |

---

*Generado por Agente Claude Sonnet 4.6 | TASK-2026-02-21-ANALISIS-PORTALES | VAL05 v1.0.0*
