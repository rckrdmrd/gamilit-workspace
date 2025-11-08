# Módulo 5: Mecánicas de Producción Creativa + Auxiliares

**Objetivo Pedagógico:** Crear textos originales con intención comunicativa
**Total de Mecánicas:** 3 principales + 4 auxiliares
**Archivos de implementación:** 7+

---

## Resumen del Módulo

Este módulo implementa mecánicas enfocadas en la producción creativa de contenidos y mecánicas auxiliares de soporte. Estas mecánicas ayudan a los estudiantes a expresarse creativamente usando diferentes formatos multimedia.

---

## Mecánicas Principales

### 1. Diario Multimedia

**Tipo:** `diario_multimedia`
**Descripción:** Crear entradas de diario con multimedia

#### Características

- Editor de texto rico
- Inserción de imágenes
- Grabación de audio
- Formateo personalizado

#### Implementación

```typescript
// features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx
interface DiarioProps extends BaseExerciseProps {
  prompt: string;
  requiredElements: ('text' | 'image' | 'audio')[];
  minWords?: number;
}

export const DiarioMultimediaExercise: React.FC<DiarioProps> = ({
  prompt,
  requiredElements,
  minWords = 100,
  ...baseProps
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [audioRecording, setAudioRecording] = useState<Blob | null>(null);

  const handleImageUpload = (files: FileList) => {
    setImages(prev => [...prev, ...Array.from(files)]);
  };

  const handleAudioRecord = (blob: Blob) => {
    setAudioRecording(blob);
  };

  const validateEntry = () => {
    const wordCount = content.split(/\s+/).length;
    const hasRequiredElements = requiredElements.every(element => {
      switch (element) {
        case 'text':
          return wordCount >= minWords;
        case 'image':
          return images.length > 0;
        case 'audio':
          return audioRecording !== null;
        default:
          return false;
      }
    });

    return hasRequiredElements;
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="diario-container">
        <div className="prompt-section">
          <h2>Tema de hoy</h2>
          <p>{prompt}</p>
        </div>

        <div className="editor-section">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Escribe tu entrada de diario..."
          />

          <div className="word-counter">
            Palabras: {content.split(/\s+/).length} / {minWords}
          </div>
        </div>

        <div className="multimedia-tools">
          <ImageUploader
            images={images}
            onUpload={handleImageUpload}
            onRemove={(idx) => setImages(prev => prev.filter((_, i) => i !== idx))}
          />

          <AudioRecorder
            recording={audioRecording}
            onRecord={handleAudioRecord}
            onClear={() => setAudioRecording(null)}
          />
        </div>

        <div className="requirements-checklist">
          <h3>Elementos Requeridos</h3>
          {requiredElements.map(element => (
            <RequirementItem
              key={element}
              element={element}
              completed={/* validación */}
            />
          ))}
        </div>

        <div className="preview-section">
          <h3>Vista Previa</h3>
          <DiaryEntryPreview
            content={content}
            images={images}
            audio={audioRecording}
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

### 2. Comic Digital

**Tipo:** `comic_digital`
**Descripción:** Crear comics con herramientas digitales

#### Características

- Editor de viñetas
- Banco de personajes
- Globos de diálogo
- Efectos visuales

#### Implementación

```typescript
// features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx
interface ComicProps extends BaseExerciseProps {
  story: string;
  minPanels: number;
  characterBank: Character[];
  backgroundBank: Background[];
}

interface Panel {
  id: string;
  background: string;
  characters: PanelCharacter[];
  dialogues: Dialogue[];
}

interface PanelCharacter {
  characterId: string;
  position: { x: number; y: number };
  emotion: string;
}

interface Dialogue {
  characterId: string;
  text: string;
  type: 'speech' | 'thought' | 'narration';
}

export const ComicDigitalExercise: React.FC<ComicProps> = ({
  story,
  minPanels,
  characterBank,
  backgroundBank,
  ...baseProps
}) => {
  const [panels, setPanels] = useState<Panel[]>([createEmptyPanel()]);
  const [selectedPanel, setSelectedPanel] = useState(0);

  const addPanel = () => {
    setPanels(prev => [...prev, createEmptyPanel()]);
  };

  const updatePanel = (panelId: string, updates: Partial<Panel>) => {
    setPanels(prev =>
      prev.map(p => (p.id === panelId ? { ...p, ...updates } : p))
    );
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="comic-container">
        <div className="story-prompt">
          <h2>Historia</h2>
          <p>{story}</p>
        </div>

        <div className="comic-workspace">
          <div className="panels-timeline">
            {panels.map((panel, idx) => (
              <PanelThumbnail
                key={panel.id}
                panel={panel}
                index={idx}
                isSelected={selectedPanel === idx}
                onClick={() => setSelectedPanel(idx)}
              />
            ))}
            <button onClick={addPanel}>+ Añadir Viñeta</button>
          </div>

          <div className="panel-editor">
            <PanelCanvas
              panel={panels[selectedPanel]}
              onUpdate={(updates) => updatePanel(panels[selectedPanel].id, updates)}
            />
          </div>

          <div className="tools-panel">
            <ToolSection title="Fondos">
              <BackgroundSelector
                backgrounds={backgroundBank}
                onSelect={(bg) =>
                  updatePanel(panels[selectedPanel].id, { background: bg.id })
                }
              />
            </ToolSection>

            <ToolSection title="Personajes">
              <CharacterSelector
                characters={characterBank}
                onSelect={(char) => {
                  // Añadir personaje al panel
                }}
              />
            </ToolSection>

            <ToolSection title="Diálogos">
              <DialogueEditor
                dialogues={panels[selectedPanel].dialogues}
                onAdd={(dialogue) => {
                  updatePanel(panels[selectedPanel].id, {
                    dialogues: [...panels[selectedPanel].dialogues, dialogue],
                  });
                }}
              />
            </ToolSection>
          </div>
        </div>

        <div className="comic-preview">
          <h3>Vista Previa</h3>
          <ComicStrip panels={panels} />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

### 3. Video Carta

**Tipo:** `video_carta`
**Descripción:** Grabar mensajes en video

#### Características

- Grabación de video
- Edición básica
- Guión estructurado
- Revisión

#### Implementación

```typescript
// features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx
interface VideoCartaProps extends BaseExerciseProps {
  recipient: string;
  purpose: string;
  structure: VideoStructure;
  maxDuration: number; // segundos
}

interface VideoStructure {
  introduction: string;
  body: string[];
  conclusion: string;
}

export const VideoCartaExercise: React.FC<VideoCartaProps> = ({
  recipient,
  purpose,
  structure,
  maxDuration,
  ...baseProps
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [script, setScript] = useState('');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Iniciar grabación
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="video-carta-container">
        <div className="briefing-section">
          <h2>Video Carta para: {recipient}</h2>
          <p><strong>Propósito:</strong> {purpose}</p>
          <p><strong>Duración máxima:</strong> {maxDuration} segundos</p>
        </div>

        <div className="structure-guide">
          <h3>Estructura Sugerida</h3>
          <StructureChecklist structure={structure} />
        </div>

        <div className="script-section">
          <h3>Guión (Opcional)</h3>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Escribe tu guión aquí..."
          />
        </div>

        <div className="recording-section">
          <div className="camera-preview">
            {isRecording ? (
              <CameraFeed onStop={stopRecording} />
            ) : videoBlob ? (
              <VideoPreview blob={videoBlob} />
            ) : (
              <CameraPlaceholder />
            )}
          </div>

          <div className="recording-controls">
            {!isRecording && !videoBlob && (
              <button onClick={startRecording} className="btn-record">
                Iniciar Grabación
              </button>
            )}

            {isRecording && (
              <>
                <span className="recording-indicator">
                  Grabando... {duration}s / {maxDuration}s
                </span>
                <button onClick={stopRecording} className="btn-stop">
                  Detener
                </button>
              </>
            )}

            {videoBlob && (
              <div className="video-actions">
                <button onClick={() => setVideoBlob(null)}>
                  Grabar de Nuevo
                </button>
                <button>Guardar Video</button>
              </div>
            )}
          </div>
        </div>

        <div className="requirements-checklist">
          <h3>Checklist</h3>
          <ChecklistItem label="Introducción clara" checked={/* validación */} />
          <ChecklistItem label="Desarrollo del mensaje" checked={/* validación */} />
          <ChecklistItem label="Conclusión apropiada" checked={/* validación */} />
          <ChecklistItem label="Duración dentro del límite" checked={duration <= maxDuration} />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## Mecánicas Auxiliares

### 4. Call to Action

**Tipo:** `call_to_action`
**Descripción:** Presentación motivacional

Mecánica simple de presentación que introduce módulos o desafíos especiales.

---

### 5. Collage de Prensa

**Tipo:** `collage_prensa`
**Descripción:** Crear collages temáticos

Combina recortes de noticias y medios para crear composiciones visuales temáticas.

---

### 6. Comprensión Auditiva

**Tipo:** `comprension_auditiva`
**Descripción:** Ejercicios basados en audio

Reproducción de contenido de audio seguida de preguntas de comprensión.

---

### 7. Texto en Movimiento

**Tipo:** `texto_movimiento`
**Descripción:** Textos con animaciones

Textos que se revelan progresivamente con animaciones para enfatizar comprensión secuencial.

---

## Mejores Prácticas

### Desarrollo de Nuevas Mecánicas

**Checklist:**

1. ✅ Heredar de `BaseExercise`
2. ✅ Definir props tipadas
3. ✅ Implementar validación de respuestas
4. ✅ Calcular scoring correctamente
5. ✅ Proveer feedback claro
6. ✅ Manejar errores gracefully
7. ✅ Probar con datos reales de DB
8. ✅ Documentar configuración esperada

### Testing

```typescript
// features/mechanics/module5/DiarioMultimedia/__tests__/DiarioMultimedia.test.tsx
describe('DiarioMultimediaExercise', () => {
  it('should validate minimum word count', () => {
    const { getByPlaceholderText } = render(
      <DiarioMultimediaExercise
        prompt="Describe tu día"
        requiredElements={['text']}
        minWords={100}
        exerciseId="test-123"
        config={mockConfig}
        onComplete={mockOnComplete}
      />
    );

    const editor = getByPlaceholderText('Escribe tu entrada de diario...');
    fireEvent.change(editor, { target: { value: 'Texto muy corto' } });

    // Verificar que no se puede enviar con menos palabras
    expect(/* validación */).toBe(false);
  });

  it('should accept image uploads', () => {
    // Test implementation
  });

  it('should record and save audio', () => {
    // Test implementation
  });
});
```

### Accesibilidad

- **Keyboard navigation**: Todas las mecánicas deben ser navegables con teclado
- **Screen reader support**: Etiquetas ARIA apropiadas
- **Color contrast**: Cumplir WCAG 2.1 AA
- **Font size adjustable**: Soportar zoom hasta 200%
- **Alternative text**: Describir todas las imágenes

**Ejemplo:**

```typescript
<button
  onClick={handleSubmit}
  aria-label="Enviar ejercicio"
  aria-disabled={!isValid}
>
  Enviar
</button>
```

---

## Roadmap de Mecánicas

### Fase Actual (v2.0)
- ✅ 33 mecánicas implementadas
- ✅ Sistema de scoring completo
- ✅ Integración con gamificación
- ✅ Configuración desde DB

### Próximas Mecánicas (v2.1)
- 🔄 Realidad Aumentada (AR)
- 🔄 Reconocimiento de voz
- 🔄 Generación con IA
- 🔄 Colaboración en tiempo real

### Futuro (v3.0)
- 📋 VR experiences
- 📋 Adaptive difficulty
- 📋 Personalized learning paths
- 📋 AI tutoring

---

## Estructura Completa de Archivos

```
features/mechanics/
├── shared/
│   ├── BaseExercise.tsx
│   ├── types.ts
│   ├── scoring.ts
│   ├── hooks/
│   │   └── useExerciseSubmission.ts
│   ├── components/
│   │   ├── ExerciseHeader.tsx
│   │   ├── ExerciseFooter.tsx
│   │   ├── FeedbackModal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ScoreDisplay.tsx
│   └── api/
│       └── mechanicsAPI.ts
│
├── module1/          # Comprensión Literal (7 mecánicas)
├── module2/          # Comprensión Inferencial (5 mecánicas)
├── module3/          # Comprensión Crítica (5 mecánicas)
├── module4/          # Textos Digitales (9 mecánicas)
│
└── module5/          # Producción Creativa (3+4 mecánicas)
    ├── DiarioMultimedia/
    │   ├── DiarioMultimediaExercise.tsx
    │   ├── RichTextEditor.tsx
    │   ├── ImageUploader.tsx
    │   ├── AudioRecorder.tsx
    │   ├── DiaryEntryPreview.tsx
    │   └── types.ts
    ├── ComicDigital/
    │   ├── ComicDigitalExercise.tsx
    │   ├── PanelCanvas.tsx
    │   ├── PanelThumbnail.tsx
    │   ├── CharacterSelector.tsx
    │   ├── BackgroundSelector.tsx
    │   ├── DialogueEditor.tsx
    │   ├── ComicStrip.tsx
    │   └── types.ts
    ├── VideoCarta/
    │   ├── VideoCartaExercise.tsx
    │   ├── CameraFeed.tsx
    │   ├── VideoPreview.tsx
    │   ├── StructureChecklist.tsx
    │   └── types.ts
    └── auxiliar/
        ├── CallToAction/
        ├── CollagePrensa/
        ├── ComprensionAuditiva/
        └── TextoMovimiento/
```

---

## Ubicación en el Código

**Directorio Principal:** `/src/features/mechanics/`

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
**Total de Mecánicas Documentadas:** 33+
**Líneas de Código Estimadas:** ~15,000+
