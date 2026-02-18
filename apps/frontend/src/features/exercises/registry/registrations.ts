/**
 * Exercise Registrations
 *
 * Registers all 30 exercise mechanics in the Exercise Registry.
 * This file is the SINGLE place to add a new exercise type.
 *
 * Extracted from:
 * - ExercisePage.tsx loadMechanic() map (lines 87-162)
 * - exerciseAdapter.ts adapter functions
 *
 * @version 1.0.0
 * @since Phase 1 - Exercise System Restructuring
 */

import { registerExercise } from './exercise-registry';
import {
  adaptToCrucigramaData,
  adaptToTimelineData,
  adaptToVerdaderoFalsoData,
  adaptToEmparejamientoData,
  adaptToCompletarEspaciosData,
  adaptToSopaLetrasData,
  adaptToMapaConceptualData,
  adaptToLecturaInferencialData,
  adaptToCausaEfectoData,
  adaptToPrediccionNarrativaData,
  adaptToPuzzleContextoData,
  adaptToTribunalOpinionesData,
  adaptToQuizTikTokData,
  adaptToInfografiaInteractivaData,
  adaptToVerificadorFakeNewsData,
  adaptToNavegacionHipertextualData,
  adaptToAnalisisMemesData,
  adaptToDiarioMultimediaData,
  adaptToComicDigitalData,
  adaptToVideoCartaData,
  adaptToBaseExercise,
} from '@shared/utils/exerciseAdapter';

// ============================================================================
// MODULE 1 - Comprensión Literal (7 mechanics)
// ============================================================================

registerExercise(['crucigrama', 'crucigrama_cientifico'], {
  loader: () => import('@/features/mechanics/module1/Crucigrama/CrucigramaExercise'),
  adapter: adaptToCrucigramaData,
  meta: { displayName: 'Crucigrama', module: 1, category: 'literal', icon: 'grid-3x3' },
});

registerExercise(['linea_tiempo', 'timeline'], {
  loader: () => import('@/features/mechanics/module1/Timeline/TimelineExercise'),
  adapter: adaptToTimelineData,
  meta: { displayName: 'Línea de Tiempo', module: 1, category: 'literal', icon: 'clock' },
});

registerExercise('sopa_letras', {
  loader: () => import('@/features/mechanics/module1/SopaLetras/SopaLetrasExercise'),
  adapter: adaptToSopaLetrasData,
  meta: { displayName: 'Sopa de Letras', module: 1, category: 'literal', icon: 'search' },
});

registerExercise('mapa_conceptual', {
  loader: () => import('@/features/mechanics/module1/MapaConceptual/MapaConceptualExercise'),
  adapter: adaptToMapaConceptualData,
  meta: { displayName: 'Mapa Conceptual', module: 1, category: 'literal', icon: 'network' },
});

registerExercise('emparejamiento', {
  loader: () => import('@/features/mechanics/module1/Emparejamiento/EmparejamientoExercise'),
  adapter: adaptToEmparejamientoData,
  meta: { displayName: 'Emparejamiento', module: 1, category: 'literal', icon: 'link' },
});

registerExercise('verdadero_falso', {
  loader: () => import('@/features/mechanics/module1/VerdaderoFalso/VerdaderoFalsoExercise'),
  adapter: adaptToVerdaderoFalsoData,
  meta: { displayName: 'Verdadero/Falso', module: 1, category: 'literal', icon: 'check-circle' },
});

registerExercise('completar_espacios', {
  loader: () => import('@/features/mechanics/module1/CompletarEspacios/CompletarEspaciosExercise'),
  adapter: adaptToCompletarEspaciosData,
  meta: { displayName: 'Completar Espacios', module: 1, category: 'literal', icon: 'text-cursor-input' },
});

// ============================================================================
// MODULE 2 - Comprensión Inferencial (6 mechanics)
// ============================================================================

registerExercise('detective_textual', {
  loader: () => import('@/features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise'),
  adapter: adaptToLecturaInferencialData,
  meta: { displayName: 'Detective Textual', module: 2, category: 'inferencial', icon: 'search' },
});

registerExercise('lectura_inferencial', {
  loader: () => import('@/features/mechanics/module2/LecturaInferencial/LecturaInferencialExercise'),
  adapter: adaptToLecturaInferencialData,
  meta: { displayName: 'Lectura Inferencial', module: 2, category: 'inferencial', icon: 'book-open' },
});

registerExercise('construccion_hipotesis', {
  loader: () => import('@/features/mechanics/module2/ConstruccionHipotesis/CausaEfectoExercise'),
  adapter: adaptToCausaEfectoData,
  meta: { displayName: 'Causa y Efecto', module: 2, category: 'inferencial', icon: 'git-branch' },
});

registerExercise('prediccion_narrativa', {
  loader: () => import('@/features/mechanics/module2/PrediccionNarrativa/PrediccionNarrativaExercise'),
  adapter: adaptToPrediccionNarrativaData,
  meta: { displayName: 'Predicción Narrativa', module: 2, category: 'inferencial', icon: 'sparkles' },
});

registerExercise('puzzle_contexto', {
  loader: () => import('@/features/mechanics/module2/PuzzleContexto/PuzzleContextoExercise'),
  adapter: adaptToPuzzleContextoData,
  meta: { displayName: 'Puzzle de Contexto', module: 2, category: 'inferencial', icon: 'puzzle' },
});

registerExercise('rueda_inferencias', {
  loader: () => import('@/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise'),
  adapter: adaptToLecturaInferencialData,
  meta: { displayName: 'Rueda de Inferencias', module: 2, category: 'inferencial', icon: 'rotate-cw' },
});

// ============================================================================
// MODULE 3 - Comprensión Crítica (5 mechanics)
// ============================================================================

registerExercise('analisis_fuentes', {
  loader: () => import('@/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Análisis de Fuentes', module: 3, category: 'critica', icon: 'file-search' },
});

registerExercise('debate_digital', {
  loader: () => import('@/features/mechanics/module3/DebateDigital/DebateDigitalExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Debate Digital', module: 3, category: 'critica', icon: 'message-circle' },
});

registerExercise('matriz_perspectivas', {
  loader: () => import('@/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Matriz de Perspectivas', module: 3, category: 'critica', icon: 'table' },
});

registerExercise('podcast_argumentativo', {
  loader: () => import('@/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Podcast Argumentativo', module: 3, category: 'critica', icon: 'mic' },
});

registerExercise('tribunal_opiniones', {
  loader: () => import('@/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise'),
  adapter: adaptToTribunalOpinionesData,
  meta: { displayName: 'Tribunal de Opiniones', module: 3, category: 'critica', icon: 'scale' },
});

// ============================================================================
// MODULE 4 - Textos Digitales y Multimediales (5 mechanics)
// ============================================================================

registerExercise(['verificador_fake_news', 'verificador_fakenews', 'fake_news'], {
  loader: () => import('@/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise'),
  adapter: adaptToVerificadorFakeNewsData,
  meta: { displayName: 'Verificador Fake News', module: 4, category: 'digital', icon: 'shield-alert' },
});

registerExercise('quiz_tiktok', {
  loader: () => import('@/features/mechanics/module4/QuizTikTok/QuizTikTokExercise'),
  adapter: adaptToQuizTikTokData,
  meta: { displayName: 'Quiz TikTok', module: 4, category: 'digital', icon: 'smartphone' },
});

registerExercise('navegacion_hipertextual', {
  loader: () => import('@/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise'),
  adapter: adaptToNavegacionHipertextualData,
  meta: { displayName: 'Navegación Hipertextual', module: 4, category: 'digital', icon: 'link-2' },
});

registerExercise('analisis_memes', {
  loader: () => import('@/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise'),
  adapter: adaptToAnalisisMemesData,
  meta: { displayName: 'Análisis de Memes', module: 4, category: 'digital', icon: 'image' },
});

registerExercise('infografia_interactiva', {
  loader: () => import('@/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise'),
  adapter: adaptToInfografiaInteractivaData,
  meta: { displayName: 'Infografía Interactiva', module: 4, category: 'digital', icon: 'bar-chart' },
});

// ============================================================================
// MODULE 5 - Producción Creativa (3 mechanics)
// ============================================================================

registerExercise('diario_multimedia', {
  loader: () => import('@/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise'),
  adapter: adaptToDiarioMultimediaData,
  meta: { displayName: 'Diario Multimedia', module: 5, category: 'creativa', icon: 'book' },
});

registerExercise('comic_digital', {
  loader: () => import('@/features/mechanics/module5/ComicDigital/ComicDigitalExercise'),
  adapter: adaptToComicDigitalData,
  meta: { displayName: 'Comic Digital', module: 5, category: 'creativa', icon: 'frame' },
});

registerExercise('video_carta', {
  loader: () => import('@/features/mechanics/module5/VideoCarta/VideoCartaExercise'),
  adapter: adaptToVideoCartaData,
  meta: { displayName: 'Video Carta', module: 5, category: 'creativa', icon: 'video' },
});

// ============================================================================
// AUXILIAR MECHANICS (4 mechanics)
// ============================================================================

registerExercise('call_to_action', {
  loader: () => import('@/features/mechanics/auxiliar/CallToAction/CallToActionExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Call to Action', module: 0, category: 'auxiliar', icon: 'megaphone' },
});

registerExercise('collage_prensa', {
  loader: () => import('@/features/mechanics/auxiliar/CollagePrensa/CollagePrensaExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Collage de Prensa', module: 0, category: 'auxiliar', icon: 'scissors' },
});

registerExercise('comprension_auditiva', {
  loader: () => import('@/features/mechanics/auxiliar/ComprensiónAuditiva/ComprensiónAuditivaExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Comprensión Auditiva', module: 0, category: 'auxiliar', icon: 'headphones' },
});

registerExercise('texto_movimiento', {
  loader: () => import('@/features/mechanics/auxiliar/TextoEnMovimiento/TextoEnMovimientoExercise'),
  adapter: adaptToBaseExercise,
  meta: { displayName: 'Texto en Movimiento', module: 0, category: 'auxiliar', icon: 'type' },
});
