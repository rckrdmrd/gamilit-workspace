import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Type, MessageSquare, Download, Send, Loader2, CheckCircle, GripVertical, Trash2, X, Lightbulb, LayoutTemplate, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import type { ComicPanel, SpeechBubble, ComicSticker, ProgressData, ExerciseFromPage, ComicTemplate } from './comicDigitalTypes';
import { mockLayouts, mockBackgrounds, mockSuggestedScenes, mockTemplates, STICKER_DEFINITIONS } from './comicDigitalMockData';

interface ExerciseProps {
  exerciseId?: string;
  exercise?: ExerciseFromPage;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgressUpdate?: (data: ProgressData) => void;
  onExit?: () => void;
}

// Aligned with backend @ArrayMinSize(4) / @ArrayMaxSize(6)
const MIN_PANELS_REQUIRED = 4;
const MAX_PANELS = 6;

/** Returns Tailwind width class for panel layout inside a flex-wrap container */
const getLayoutWidthClass = (layout: ComicPanel['layout']): string => {
  switch (layout) {
    case 'half': return 'w-full sm:w-[calc(50%-0.5rem)]';
    case 'third': return 'w-full sm:w-[calc(33.33%-0.67rem)]';
    default: return 'w-full';
  }
};

// --- Sortable Panel Wrapper (replaces ReorderablePanel + Reorder.Item) ---
const SortablePanel = ({
  panel,
  index,
  isSelected,
  background,
  onSelect,
  onDelete,
  children,
}: {
  panel: ComicPanel;
  index: number;
  isSelected: boolean;
  background: typeof mockBackgrounds[number] | undefined;
  onSelect: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    minHeight: '200px',
  };

  const bg = background || mockBackgrounds[0];
  const layoutLabel = panel.layout === 'half' ? '½ Panel' : panel.layout === 'third' ? '⅓ Panel' : 'Completo';
  const widthClass = getLayoutWidthClass(panel.layout);

  const illustrationStyle: React.CSSProperties | undefined = bg.illustrationUrl
    ? {
        backgroundImage: `url(${bg.illustrationUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${widthClass} ${bg.gradientClasses} ${bg.accentBorder} border-4 border-detective-text p-4 cursor-pointer relative overflow-hidden ${
        isSelected ? 'ring-4 ring-detective-orange' : ''
      }`}
      onClick={onSelect}
      {...attributes}
    >
      {/* Illustration overlay */}
      {illustrationStyle && (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={illustrationStyle}
        />
      )}

      {/* Background icon decorative overlay */}
      <div className="absolute bottom-2 right-2 text-4xl opacity-20 pointer-events-none select-none">
        {bg.icon}
      </div>

      {/* Panel number badge */}
      <div className="absolute top-2 left-2 bg-detective-text text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10">
        {index + 1}
      </div>

      {/* Layout indicator badge */}
      <div className="absolute top-2 left-12 bg-detective-text/70 text-white text-xs px-2 py-1 rounded z-10">
        {layoutLabel}
      </div>

      {/* Drag handle — activator only */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className="absolute top-2 right-14 bg-detective-text/10 hover:bg-detective-text/20 text-detective-text p-1 rounded cursor-grab active:cursor-grabbing z-10 touch-none min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Arrastra para reordenar"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Eliminar panel"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {children}
    </div>
  );
};

// --- Panel Drag Preview (for DragOverlay) ---
const PanelDragPreview = ({ panel }: { panel: ComicPanel | undefined }) => {
  if (!panel) return null;
  const bg = mockBackgrounds.find(b => b.id === panel.background) || mockBackgrounds[0];
  return (
    <div className={`${bg.gradientClasses} border-4 border-detective-orange p-4 rounded-detective shadow-2xl opacity-90 w-full max-w-md`}>
      <p className="text-sm font-bold text-detective-text truncate">{panel.text || `Panel ${panel.layout}`}</p>
      <p className="text-xs text-detective-text-secondary">
        {panel.speechBubbles.length} globos · {panel.stickers.length} stickers
      </p>
    </div>
  );
};

// --- Draggable Speech Bubble (pointer events, no framer-motion drag) ---
const DraggableBubble = ({
  bubble,
  panelElement,
  isEditing,
  onStartEdit,
  onUpdateText,
  onUpdatePosition,
  onDelete,
}: {
  bubble: SpeechBubble;
  panelElement: HTMLDivElement | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onUpdateText: (text: string) => void;
  onUpdatePosition: (x: number, y: number) => void;
  onDelete: () => void;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPct = useRef({ x: bubble.x, y: bubble.y });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't start drag if editing text
    if (isEditing) return;
    const el = elRef.current;
    if (!el || !panelElement) return;
    el.setPointerCapture(e.pointerId);
    dragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPct.current = { x: bubble.x, y: bubble.y };
    el.style.cursor = 'grabbing';
    e.preventDefault();
    e.stopPropagation();
  }, [bubble.x, bubble.y, isEditing, panelElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !panelElement || !elRef.current) return;
    const rect = panelElement.getBoundingClientRect();
    const dx = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * 100;
    const newX = Math.max(0, Math.min(90, startPct.current.x + dx));
    const newY = Math.max(0, Math.min(90, startPct.current.y + dy));
    // DOM-direct update for smooth movement — no React re-render during drag
    elRef.current.style.left = `${newX}%`;
    elRef.current.style.top = `${newY}%`;
  }, [panelElement]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !panelElement) return;
    dragging.current = false;
    const el = elRef.current;
    if (el) el.style.cursor = '';

    // Click vs drag: movement < 5px (Manhattan) = click → toggle editing
    const totalMovement = Math.abs(e.clientX - startPos.current.x) + Math.abs(e.clientY - startPos.current.y);
    if (totalMovement < 5) {
      onStartEdit();
      return;
    }

    const rect = panelElement.getBoundingClientRect();
    const dx = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * 100;
    const finalX = Math.max(0, Math.min(90, startPct.current.x + dx));
    const finalY = Math.max(0, Math.min(90, startPct.current.y + dy));
    onUpdatePosition(finalX, finalY);
  }, [panelElement, onUpdatePosition, onStartEdit]);

  const bubbleStyle = bubble.type === 'speech'
    ? 'bg-white border-2 border-detective-text rounded-xl'
    : bubble.type === 'thought'
    ? 'bg-white border-2 border-detective-text rounded-full'
    : 'bg-detective-gold/10 border-2 border-detective-gold';

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute ${bubbleStyle} px-3 py-2 max-w-[60%] cursor-grab z-20 group touch-none`}
      style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
    >
      {/* Delete bubble button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
        title="Eliminar globo"
      >
        <X className="w-3 h-3" />
      </button>

      {isEditing ? (
        <textarea
          autoFocus
          value={bubble.text}
          onChange={(e) => onUpdateText(e.target.value)}
          onBlur={() => onStartEdit()} // toggle off
          onPointerDownCapture={(e) => e.stopPropagation()} // prevent drag when typing
          className="text-sm text-detective-text font-medium bg-transparent border-none outline-none resize-none w-full min-w-[100px]"
          rows={2}
        />
      ) : (
        <p
          onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
          className="text-sm text-detective-text font-medium cursor-text"
        >
          {bubble.text}
        </p>
      )}
    </div>
  );
};

// --- Draggable Sticker (pointer events, same pattern as bubble) ---
const DraggableSticker = ({
  sticker,
  panelElement,
  onUpdatePosition,
  onDelete,
}: {
  sticker: ComicSticker;
  panelElement: HTMLDivElement | null;
  onUpdatePosition: (x: number, y: number) => void;
  onDelete: () => void;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPct = useRef({ x: sticker.x, y: sticker.y });

  const definition = STICKER_DEFINITIONS.find(s => s.id === sticker.assetId);
  if (!definition) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = elRef.current;
    if (!el || !panelElement) return;
    el.setPointerCapture(e.pointerId);
    dragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startPct.current = { x: sticker.x, y: sticker.y };
    el.style.cursor = 'grabbing';
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !panelElement || !elRef.current) return;
    const rect = panelElement.getBoundingClientRect();
    const dx = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * 100;
    const newX = Math.max(0, Math.min(90, startPct.current.x + dx));
    const newY = Math.max(0, Math.min(90, startPct.current.y + dy));
    elRef.current.style.left = `${newX}%`;
    elRef.current.style.top = `${newY}%`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging.current || !panelElement) return;
    dragging.current = false;
    const el = elRef.current;
    if (el) el.style.cursor = '';
    const rect = panelElement.getBoundingClientRect();
    const dx = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * 100;
    const finalX = Math.max(0, Math.min(90, startPct.current.x + dx));
    const finalY = Math.max(0, Math.min(90, startPct.current.y + dy));
    onUpdatePosition(finalX, finalY);
  };

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="absolute cursor-grab z-20 group touch-none"
      style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
    >
      <div
        className="bg-white/80 rounded-full shadow-md flex items-center justify-center select-none"
        style={{
          width: `${sticker.scale * 48}px`,
          height: `${sticker.scale * 48}px`,
          fontSize: `${sticker.scale * 28}px`,
        }}
        title={definition.label}
      >
        {definition.emoji}
      </div>
      {/* Delete sticker button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
        title="Eliminar sticker"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// --- Main Component ---
export const ComicDigitalExercise = ({
  exerciseId = 'comic-digital-default',
  exercise,
  onComplete,
  onProgressUpdate,
  onExit: _onExit
}: ExerciseProps) => {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [title, setTitle] = useState('La Historia de Marie Curie');
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [usedScenes, setUsedScenes] = useState<Set<string>>(new Set());
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [expandedStickerCategories, setExpandedStickerCategories] = useState<Record<string, boolean>>({
    character: true,
    prop: false,
    effect: false,
  });

  // Refs for panel content areas (used by pointer-event drag)
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // P5 FIX: Read suggestedScenes/templates from adapter top-level first, then nested paths as fallback
  const exerciseAny = exercise as (ExerciseFromPage & { suggestedScenes?: string[]; templates?: ComicTemplate[] }) | undefined;
  const suggestedScenes: string[] = exerciseAny?.suggestedScenes
    || exercise?.mechanicData?.content?.suggestedScenes
    || exercise?.content?.suggestedScenes
    || mockSuggestedScenes;

  const templates: ComicTemplate[] = exerciseAny?.templates
    || exercise?.mechanicData?.content?.templates
    || exercise?.content?.templates
    || mockTemplates;

  // @dnd-kit sensors — same pattern as CausaEfectoExercise
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const {
    submitAsync,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '');

  // --- Handlers ---

  const addPanel = useCallback((layout: string) => {
    if (panels.length >= MAX_PANELS) return;
    const newPanel: ComicPanel = {
      id: Date.now().toString(),
      layout: layout as ComicPanel['layout'],
      text: '',
      speechBubbles: [],
      stickers: [],
      background: mockBackgrounds[0]?.id || 'lab',
    };
    setPanels(prev => [...prev, newPanel]);
    setSelectedPanel(newPanel.id);
  }, [panels.length]);

  const deletePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
    if (selectedPanel === panelId) setSelectedPanel(null);
  }, [selectedPanel]);

  const addSpeechBubble = useCallback((panelId: string, type: SpeechBubble['type']) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      const count = panel.speechBubbles.length;
      const defaultText = type === 'speech' ? 'Diálogo...' : type === 'thought' ? 'Pensamiento...' : 'Narración...';
      const newBubble: SpeechBubble = {
        id: Date.now().toString(),
        text: defaultText,
        x: 20 + (count * 15) % 60,
        y: 20 + (count * 15) % 50,
        type,
      };
      return { ...panel, speechBubbles: [...panel.speechBubbles, newBubble] };
    }));
  }, []);

  const updateBubblePosition = useCallback((panelId: string, bubbleId: string, x: number, y: number) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      return {
        ...panel,
        speechBubbles: panel.speechBubbles.map(b =>
          b.id === bubbleId ? { ...b, x, y } : b
        ),
      };
    }));
  }, []);

  const updateBubbleText = useCallback((panelId: string, bubbleId: string, text: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      return {
        ...panel,
        speechBubbles: panel.speechBubbles.map(b =>
          b.id === bubbleId ? { ...b, text } : b
        ),
      };
    }));
  }, []);

  const deleteBubble = useCallback((panelId: string, bubbleId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      return {
        ...panel,
        speechBubbles: panel.speechBubbles.filter(b => b.id !== bubbleId),
      };
    }));
    if (editingBubbleId === bubbleId) setEditingBubbleId(null);
  }, [editingBubbleId]);

  const updatePanelText = useCallback((panelId: string, text: string) => {
    setPanels(prev => prev.map(panel =>
      panel.id === panelId ? { ...panel, text } : panel
    ));
  }, []);

  const setPanelBackground = useCallback((panelId: string, bgId: string) => {
    setPanels(prev => prev.map(panel =>
      panel.id === panelId ? { ...panel, background: bgId } : panel
    ));
  }, []);

  const applyScene = useCallback((scene: string, panelId: string) => {
    updatePanelText(panelId, scene);
    setUsedScenes(prev => new Set(prev).add(scene));
  }, [updatePanelText]);

  const applyTemplate = useCallback((template: ComicTemplate) => {
    const newPanels: ComicPanel[] = template.layouts.map((layout, i) => ({
      id: `${Date.now()}-${i}`,
      layout: layout as ComicPanel['layout'],
      text: '',
      speechBubbles: [],
      stickers: [],
      background: mockBackgrounds[i % mockBackgrounds.length]?.id || 'lab',
    }));
    setPanels(newPanels);
    setSelectedPanel(newPanels[0]?.id ?? null);
  }, []);

  // --- Sticker handlers ---
  const addSticker = useCallback((panelId: string, assetId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      const count = panel.stickers.length;
      const newSticker: ComicSticker = {
        id: `sticker-${Date.now()}`,
        assetId,
        x: 10 + (count * 12) % 70,
        y: 10 + (count * 12) % 60,
        scale: 1,
      };
      return { ...panel, stickers: [...panel.stickers, newSticker] };
    }));
  }, []);

  const updateStickerPosition = useCallback((panelId: string, stickerId: string, x: number, y: number) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      return {
        ...panel,
        stickers: panel.stickers.map(s =>
          s.id === stickerId ? { ...s, x, y } : s
        ),
      };
    }));
  }, []);

  const deleteSticker = useCallback((panelId: string, stickerId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      return {
        ...panel,
        stickers: panel.stickers.filter(s => s.id !== stickerId),
      };
    }));
  }, []);

  // --- @dnd-kit panel reorder handlers ---
  const handlePanelDragStart = useCallback((event: DragStartEvent) => {
    setActivePanelId(event.active.id as string);
  }, []);

  const handlePanelDragEnd = useCallback((event: DragEndEvent) => {
    setActivePanelId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPanels(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const toggleStickerCategory = useCallback((category: string) => {
    setExpandedStickerCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // --- Progress tracking ---
  useEffect(() => {
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const score = Math.min(100, Math.round((panels.length / MIN_PANELS_REQUIRED) * 100));

    const dtoPanels = panels.map((p, index) => {
      const speechBubble = p.speechBubbles.find(b => b.type === 'speech');
      const thoughtBubble = p.speechBubbles.find(b => b.type === 'thought');
      return {
        panelNumber: index + 1,
        dialogue: speechBubble?.text || p.speechBubbles.map(b => b.text).join(' ') || '',
        narration: thoughtBubble?.text || p.text || '',
      };
    });

    onProgressUpdate?.({
      progress: {
        currentStep: panels.length,
        totalSteps: MIN_PANELS_REQUIRED,
        score,
        hintsUsed: 0,
        timeSpent,
      },
      answers: {
        panels: dtoPanels,
        title,
        metadata: {
          totalPanels: panels.length,
          comicTitle: title,
          stickers: panels.flatMap(p => p.stickers.map(s => ({
            panelId: p.id,
            assetId: s.assetId,
            x: s.x,
            y: s.y,
          }))),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panels, title, startTime]);

  // --- Submit ---
  const handleSubmit = async () => {
    if (!exerciseId || isSubmitting || isSubmitted || panels.length < MIN_PANELS_REQUIRED) return;

    const dtoPanels = panels.map((panel, index) => {
      const dialogues = panel.speechBubbles
        .filter((b) => b.type === 'speech')
        .map((b) => b.text)
        .join(' ');

      const captions = panel.speechBubbles
        .filter((b) => b.type === 'caption' || b.type === 'thought')
        .map((b) => b.text)
        .join(' ');

      return {
        panelNumber: index + 1,
        dialogue: dialogues || `Panel ${index + 1} - Sin diálogo`,
        narration: panel.text || captions || `Escena ${index + 1} del cómic sobre Marie Curie`,
        imageUrl: panel.image,
        visualDescription: panel.layout === 'full'
          ? 'Panel completo'
          : panel.layout === 'half'
          ? 'Panel mitad'
          : 'Panel tercio',
      };
    });

    try {
      const response = await submitAsync({
        panels: dtoPanels,
        metadata: {
          title,
          totalPanels: panels.length,
          totalSpeechBubbles: panels.reduce((acc, panel) => acc + panel.speechBubbles.length, 0),
          stickers: panels.flatMap(p => p.stickers.map(s => ({
            panelId: p.id,
            assetId: s.assetId,
            x: s.x,
            y: s.y,
          }))),
        },
      });

      setIsSubmitted(true);
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Cómic Enviado',
          message: MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          score: undefined,
          showConfetti: false,
          xpEarned: 0,
          mlCoinsEarned: 0,
          pendingReview: true,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };
      setFeedback({
        type: 'success',
        title: '¡Cómic Completado!',
        message: 'Tu cómic digital ha sido evaluado correctamente.',
        score: response.score,
        xpEarned: rewards.xp || 0,
        mlCoinsEarned: rewards.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(response.score, timeSpent);
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: (error instanceof Error ? error.message : null) || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    }
  };

  // Sticker category grouping
  const stickerCategories = [
    { key: 'character', label: 'Personajes' },
    { key: 'prop', label: 'Props' },
    { key: 'effect', label: 'Efectos' },
  ] as const;

  return (
    <>
      <UnifiedExerciseLayout
        title="Creador de Cómics Digitales"
        description="Crea tu propio cómic digital sobre Marie Curie con paneles, diálogos y elementos visuales."
        className="max-w-7xl"
        headerActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const exportData = {
                  title,
                  panels: panels.map((panel, index) => ({
                    panelNumber: index + 1,
                    layout: panel.layout,
                    text: panel.text,
                    background: panel.background,
                    speechBubbles: panel.speechBubbles.map((b) => ({
                      text: b.text,
                      type: b.type,
                      x: b.x,
                      y: b.y,
                    })),
                    stickers: panel.stickers.map((s) => ({
                      assetId: s.assetId,
                      x: s.x,
                      y: s.y,
                      scale: s.scale,
                    })),
                  })),
                  exportedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `comic-${title.replace(/\s+/g, '-').toLowerCase()}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button
              onClick={handleSubmit}
              disabled={panels.length < MIN_PANELS_REQUIRED || isSubmitting || isSubmitted}
              className="flex items-center gap-2 px-6 py-2 bg-white text-blue-800 rounded-xl hover:bg-white/90 transition-colors font-medium disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enviado
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Cómic ({panels.length}/{MIN_PANELS_REQUIRED})
                </>
              )}
            </button>
          </div>
        }
        headerChildren={
          <div className="flex items-center gap-4 mt-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-white/30 bg-white/10 rounded-xl text-white placeholder-white/70 focus:border-white focus:outline-none"
              placeholder="Título del cómic..."
            />
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* --- Sidebar Tools --- */}
          <div className="bg-white rounded-detective shadow-card p-3 sm:p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="font-bold text-detective-text">Herramientas</h3>

            <div>
              <p className="text-detective-text-secondary text-sm mb-2">Agregar Panel:</p>
              <div className="space-y-2">
                {mockLayouts.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => addPanel(layout.id)}
                    disabled={panels.length >= MAX_PANELS}
                    className="w-full py-2 px-4 bg-detective-bg border-2 border-detective-border rounded-detective hover:border-detective-orange transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    {layout.name}
                  </button>
                ))}
              </div>
              {panels.length >= MAX_PANELS && (
                <p className="text-xs text-detective-text-secondary mt-1">Máximo {MAX_PANELS} paneles alcanzado</p>
              )}
            </div>

            {selectedPanel && (
              <>
                <div>
                  <p className="text-detective-text-secondary text-sm mb-2">Agregar Globo:</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => addSpeechBubble(selectedPanel, 'speech')}
                      className="w-full py-2 px-4 bg-blue-50 border-2 border-blue-300 rounded-detective hover:bg-blue-100 transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Diálogo
                    </button>
                    <button
                      onClick={() => addSpeechBubble(selectedPanel, 'thought')}
                      className="w-full py-2 px-4 bg-purple-50 border-2 border-purple-300 rounded-detective hover:bg-purple-100 transition-colors text-left"
                    >
                      💭 Pensamiento
                    </button>
                    <button
                      onClick={() => addSpeechBubble(selectedPanel, 'caption')}
                      className="w-full py-2 px-4 bg-yellow-50 border-2 border-yellow-300 rounded-detective hover:bg-yellow-100 transition-colors text-left"
                    >
                      <Type className="w-4 h-4 inline mr-2" />
                      Narración
                    </button>
                  </div>
                </div>

                {/* Sticker Palette */}
                <div>
                  <p className="text-detective-text-secondary text-sm mb-2">Stickers:</p>
                  {stickerCategories.map(({ key, label }) => (
                    <div key={key} className="mb-2">
                      <button
                        onClick={() => toggleStickerCategory(key)}
                        className="flex items-center gap-1 text-xs font-semibold text-detective-text w-full text-left py-1"
                      >
                        {expandedStickerCategories[key]
                          ? <ChevronDown className="w-3 h-3" />
                          : <ChevronRight className="w-3 h-3" />
                        }
                        {label}
                      </button>
                      {expandedStickerCategories[key] && (
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          {STICKER_DEFINITIONS
                            .filter(s => s.category === key)
                            .map(sticker => (
                              <button
                                key={sticker.id}
                                onClick={() => addSticker(selectedPanel, sticker.id)}
                                className="min-w-[44px] min-h-[44px] flex flex-col items-center justify-center bg-detective-bg border border-detective-border rounded hover:border-detective-orange hover:bg-detective-gold/10 transition-colors"
                                title={sticker.label}
                              >
                                <span className="text-lg">{sticker.emoji}</span>
                                <span className="text-[10px] text-detective-text-secondary leading-tight truncate w-full text-center">{sticker.label}</span>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Background Selector — rich visual preview */}
                <div>
                  <p className="text-detective-text-secondary text-sm mb-2">Fondo del Panel:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mockBackgrounds.map(bg => {
                      const currentPanel = panels.find(p => p.id === selectedPanel);
                      const isActive = currentPanel?.background === bg.id;
                      return (
                        <button
                          key={bg.id}
                          onClick={() => setPanelBackground(selectedPanel, bg.id)}
                          className={`py-2 px-3 ${bg.gradientClasses} border-2 ${isActive ? 'border-detective-orange ring-2 ring-detective-orange' : 'border-detective-border'} rounded hover:border-detective-orange transition-colors text-xs flex items-center gap-1`}
                        >
                          <span>{bg.icon}</span>
                          <span className="truncate">{bg.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Suggested Scenes */}
                <div>
                  <p className="text-detective-text-secondary text-sm mb-2 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-detective-gold" />
                    Sugerencias de Escenas:
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {suggestedScenes.map((scene, i) => {
                      const isUsed = usedScenes.has(scene);
                      return (
                        <button
                          key={i}
                          onClick={() => !isUsed && applyScene(scene, selectedPanel)}
                          disabled={isUsed}
                          className={`w-full text-left py-1.5 px-3 rounded text-xs transition-colors ${
                            isUsed
                              ? 'text-gray-400 line-through cursor-not-allowed bg-gray-50'
                              : 'text-detective-text hover:bg-detective-gold/10 hover:text-detective-gold cursor-pointer bg-detective-bg'
                          }`}
                        >
                          {scene}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* --- Canvas Area --- */}
          <div className="lg:col-span-3 bg-white rounded-detective shadow-card p-3 sm:p-6">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-detective-text">{title}</h2>
            </div>

            <div className="border-4 border-detective-text p-4 rounded-detective bg-white min-h-[350px] sm:min-h-[600px]">
              {panels.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handlePanelDragStart}
                  onDragEnd={handlePanelDragEnd}
                >
                  <SortableContext items={panels.map(p => p.id)} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-4">
                      {panels.map((panel, index) => {
                        const bg = mockBackgrounds.find(b => b.id === panel.background);

                        return (
                          <SortablePanel
                            key={panel.id}
                            panel={panel}
                            index={index}
                            isSelected={selectedPanel === panel.id}
                            background={bg}
                            onSelect={() => setSelectedPanel(panel.id)}
                            onDelete={() => deletePanel(panel.id)}
                          >
                            {/* Panel content ref — contains stickers + bubbles */}
                            <div
                              ref={(el) => { panelRefs.current[panel.id] = el; }}
                              className="relative"
                              style={{ minHeight: '160px' }}
                            >
                              {/* Stickers */}
                              {panel.stickers.map(sticker => (
                                <DraggableSticker
                                  key={sticker.id}
                                  sticker={sticker}
                                  panelElement={panelRefs.current[panel.id]}
                                  onUpdatePosition={(x, y) => updateStickerPosition(panel.id, sticker.id, x, y)}
                                  onDelete={() => deleteSticker(panel.id, sticker.id)}
                                />
                              ))}

                              {/* Speech bubbles */}
                              {panel.speechBubbles.map(bubble => (
                                <DraggableBubble
                                  key={bubble.id}
                                  bubble={bubble}
                                  panelElement={panelRefs.current[panel.id]}
                                  isEditing={editingBubbleId === bubble.id}
                                  onStartEdit={() => setEditingBubbleId(
                                    editingBubbleId === bubble.id ? null : bubble.id
                                  )}
                                  onUpdateText={(text) => updateBubbleText(panel.id, bubble.id, text)}
                                  onUpdatePosition={(x, y) => updateBubblePosition(panel.id, bubble.id, x, y)}
                                  onDelete={() => deleteBubble(panel.id, bubble.id)}
                                />
                              ))}
                            </div>

                            {/* Panel narration textarea (shown when selected) */}
                            {selectedPanel === panel.id && (
                              <div className="mt-2 relative z-10">
                                <textarea
                                  value={panel.text}
                                  onChange={(e) => updatePanelText(panel.id, e.target.value)}
                                  placeholder="Descripción de la escena o narración..."
                                  className="w-full px-3 py-2 border-2 border-detective-border rounded focus:border-detective-orange focus:outline-none resize-none"
                                  rows={3}
                                />
                              </div>
                            )}
                          </SortablePanel>
                        );
                      })}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activePanelId && (
                      <PanelDragPreview panel={panels.find(p => p.id === activePanelId)} />
                    )}
                  </DragOverlay>
                </DndContext>
              ) : (
                /* Template Selector in empty state */
                <div className="text-center py-10 text-detective-text-secondary">
                  <LayoutTemplate className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-detective-text mb-2">Elige una plantilla para comenzar</p>
                  <p className="text-sm mb-6">o agrega paneles manualmente desde la barra lateral</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {templates.map(template => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyTemplate(template)}
                        className="bg-detective-bg border-2 border-detective-border rounded-detective p-4 hover:border-detective-orange hover:shadow-md transition-all text-left group"
                      >
                        <p className="font-bold text-detective-text text-sm group-hover:text-detective-orange transition-colors">
                          {template.name}
                        </p>
                        <p className="text-xs text-detective-text-secondary mt-1">{template.description}</p>
                        <div className="flex gap-1 mt-3">
                          {template.layouts.map((l, i) => (
                            <div
                              key={i}
                              className={`h-6 bg-detective-border rounded-sm ${
                                l === 'full' ? 'flex-1' : l === 'half' ? 'w-1/2' : 'w-1/3'
                              }`}
                              title={l === 'full' ? 'Completo' : l === 'half' ? 'Mitad' : 'Tercio'}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-detective-text-secondary mt-2">{template.panelCount} paneles</p>
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={() => addPanel('full')}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-detective-gold hover:text-detective-orange transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    O agrega un panel completo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => {
            setShowFeedback(false);
          }}
          feedback={feedback}
        />
      )}
    </>
  );
};

export default ComicDigitalExercise;
