/**
 * Module 5 DTOs - Barrel Export
 *
 * @description Exporta todos los DTOs de respuestas del Módulo 5 (Producción Creativa).
 * Solo incluye los 3 ejercicios oficiales según DocumentoDeDiseño v6.1.
 *
 * Ejercicios oficiales:
 *   5.1 Diario Multimedia (diario_multimedia)
 *   5.2 Cómic Digital (comic_digital)
 *   5.3 Video-Carta (video_carta)
 *
 * @note El estudiante elige y completa SOLO UNO de los 3 ejercicios.
 * @note TODOS los ejercicios del M5 requieren evaluación manual por un docente.
 *
 * @usage import { DiarioMultimediaAnswerDto, ComicDigitalAnswerDto, VideoCartaAnswerDto } from '@/modules/educational/dto/module5';
 *
 * @updated 2025-12-18 - CORR-M5: Alineación con DocumentoDeDiseño v6.1
 *   - Reemplazado DiarioReflexivoAnswerDto por DiarioMultimediaAnswerDto
 *   - Eliminado PodcastAnswerDto (no está en diseño oficial)
 */

export * from './diario-multimedia-answer.dto';
export * from './video-carta-answer.dto';
export * from './comic-digital-answer.dto';
