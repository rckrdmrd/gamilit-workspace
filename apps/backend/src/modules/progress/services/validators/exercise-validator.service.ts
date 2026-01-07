/**
 * ExerciseValidatorService
 *
 * @description Service for validating exercise answers before grading.
 * Extracted from ExerciseSubmissionService (P0-006: God Class division).
 *
 * Responsibilities:
 * - Exercise type validation for M4 and M5 exercises
 * - Answer structure validation
 * - Anti-redundancy checks (e.g., Completar Espacios exercise 1.3)
 * - Minimum requirements validation (word count, panel count, etc.)
 *
 * Supported exercise types:
 * - M4: verificador_fake_news, infografia_interactiva, quiz_tiktok,
 *       navegacion_hipertextual, analisis_memes (FIX GAP-MED-001)
 * - M5: diario_multimedia, comic_digital, video_carta
 *
 * @see ExerciseSubmissionService - Orchestrates validation + grading + rewards
 * @see ExerciseGradingService - Handles scoring after validation
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '@/modules/educational/entities';
import { ExerciseAnswerValidator } from '../../dto/answers';

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Anti-redundancy check result
 */
export interface RedundancyCheckResult {
  hasRedundancy: boolean;
  affectedFields?: string[];
  detectedValue?: string;
  message?: string;
}

@Injectable()
export class ExerciseValidatorService {
  constructor(
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Validates exercise answers based on type and requirements
   *
   * @param exerciseId - Exercise ID
   * @param answers - User submitted answers
   * @returns ValidationResult with status and errors
   */
  async validateExercise(
    exerciseId: string,
    answers: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });

    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, unknown> = {};

    // Validate based on exercise type
    switch (exercise.exercise_type) {
      // ===== MODULE 4 VALIDATORS =====
      // FIX GAP-MED-001: Validadores específicos M4

      case 'verificador_fake_news':
        this.validateVerificadorFakeNews(answers, errors, metadata);
        break;

      case 'infografia_interactiva':
        this.validateInfografiaInteractiva(answers, errors, metadata);
        break;

      case 'quiz_tiktok':
        this.validateQuizTikTok(answers, errors, metadata);
        break;

      case 'navegacion_hipertextual':
        this.validateNavegacionHipertextual(answers, errors, metadata);
        break;

      case 'analisis_memes':
        this.validateAnalisisMemes(answers, errors, metadata);
        break;

      // ===== MODULE 5 VALIDATORS =====

      case 'diario_multimedia':
        this.validateDiarioMultimedia(answers, errors, metadata);
        break;

      case 'comic_digital':
        this.validateComicDigital(answers, errors, metadata);
        break;

      case 'video_carta':
        this.validateVideoCarta(answers, errors, metadata);
        break;

      // ===== OTHER VALIDATORS =====

      case 'completar_espacios':
        const redundancyResult = this.checkAntiRedundancy(answers);
        if (redundancyResult.hasRedundancy) {
          errors.push(redundancyResult.message || 'Redundancy detected');
        }
        break;

      default:
        // Default validation via ExerciseAnswerValidator
        break;
    }

    // FE-059: Validate answer structure using centralized validator
    try {
      await ExerciseAnswerValidator.validate(exercise.exercise_type, answers);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validates diario_multimedia exercise requirements
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateDiarioMultimedia(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const content = (answers.content || answers.text || '') as string;
    const wordCount = this.countWords(content);
    metadata.wordCount = wordCount;

    const minWords = 150;
    if (wordCount < minWords) {
      errors.push(
        `El diario debe tener al menos ${minWords} palabras. Actualmente tienes ${wordCount} palabras.`,
      );
    }
  }

  /**
   * Validates comic_digital exercise requirements
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateComicDigital(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const panels = (answers.panels || []) as Array<{ text?: string; image?: string; imageUrl?: string }>;
    const minPanels = 4;
    metadata.panelCount = panels.length;

    if (panels.length < minPanels) {
      errors.push(
        `El comic debe tener al menos ${minPanels} paneles. Actualmente tienes ${panels.length} paneles.`,
      );
      return;
    }

    // Validate each panel has content
    const emptyPanels = panels.filter((panel) => {
      const hasText = panel.text && panel.text.trim().length > 0;
      const hasImage = panel.image || panel.imageUrl;
      return !hasText && !hasImage;
    });

    if (emptyPanels.length > 0) {
      errors.push(
        `Todos los paneles deben tener contenido (texto o imagen). Tienes ${emptyPanels.length} panel(es) vacio(s).`,
      );
    }
  }

  /**
   * Validates video_carta exercise requirements
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateVideoCarta(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const videoUrl = answers.videoUrl || answers.url || answers.video;
    const answerMetadata = (answers.metadata || {}) as { duration?: number };

    if (!videoUrl) {
      errors.push('Debes subir o proporcionar la URL de tu video carta.');
      return;
    }

    metadata.videoUrl = videoUrl;

    const minDuration = 30; // seconds
    if (answerMetadata.duration !== undefined) {
      metadata.duration = answerMetadata.duration;
      if (answerMetadata.duration < minDuration) {
        errors.push(
          `La video carta debe tener al menos ${minDuration} segundos de duracion. Tu video tiene ${answerMetadata.duration} segundos.`,
        );
      }
    }
  }

  // =========================================================================
  // MODULE 4 VALIDATORS - FIX GAP-MED-001
  // =========================================================================

  /**
   * Validates verificador_fake_news exercise requirements
   *
   * @description Requires at least 3 claims to be verified
   * Supports multiple input formats for backwards compatibility:
   * - claims_verified (DTO format): [{ claim_id, is_fake, evidence }]
   * - verifiedClaims (legacy format): [{ claim, verdict, evidence }]
   * - claims (fallback): same as verifiedClaims
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateVerificadorFakeNews(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const minClaims = 3;

    // Support multiple input formats for robustness
    // Priority: claims_verified (DTO format) > verifiedClaims > claims
    const claimsVerifiedDto = answers.claims_verified as Array<{
      claim_id?: string;
      is_fake?: boolean;
      evidence?: string;
    }> | undefined;

    const verifiedClaimsLegacy = (answers.verifiedClaims || answers.claims) as Array<{
      claim?: string;
      verdict?: string;
      evidence?: string;
    }> | undefined;

    // Determine which format is being used and normalize
    let normalizedClaims: Array<{
      hasVerdict: boolean;
      hasEvidence: boolean;
    }> = [];

    if (claimsVerifiedDto && Array.isArray(claimsVerifiedDto) && claimsVerifiedDto.length > 0) {
      // DTO format: claims_verified with claim_id, is_fake, evidence
      normalizedClaims = claimsVerifiedDto.map((claim) => ({
        hasVerdict: typeof claim.is_fake === 'boolean',
        hasEvidence: !!(claim.evidence && claim.evidence.trim().length >= 10),
      }));
      metadata.inputFormat = 'dto';
    } else if (verifiedClaimsLegacy && Array.isArray(verifiedClaimsLegacy) && verifiedClaimsLegacy.length > 0) {
      // Legacy format: verifiedClaims with verdict, evidence
      normalizedClaims = verifiedClaimsLegacy.map((claim) => ({
        hasVerdict: !!(claim.verdict && claim.verdict.trim().length > 0),
        hasEvidence: !!(claim.evidence && claim.evidence.trim().length > 0),
      }));
      metadata.inputFormat = 'legacy';
    }

    metadata.verifiedClaimsCount = normalizedClaims.length;

    if (normalizedClaims.length < minClaims) {
      errors.push(
        `Debes verificar al menos ${minClaims} afirmaciones. Actualmente has verificado ${normalizedClaims.length}.`,
      );
      return;
    }

    // Validate each claim has a verdict and evidence
    const incompleteClaims = normalizedClaims.filter((claim) => {
      return !claim.hasVerdict || !claim.hasEvidence;
    });

    if (incompleteClaims.length > 0) {
      errors.push(
        `Todas las afirmaciones deben tener veredicto y evidencia. Tienes ${incompleteClaims.length} afirmacion(es) incompleta(s).`,
      );
    }

    metadata.completedClaims = normalizedClaims.length - incompleteClaims.length;
  }

  /**
   * Validates infografia_interactiva exercise requirements
   *
   * @description Requires at least 2 sections to be explored
   * Supports multiple input formats for backwards compatibility:
   * - sections_explored (DTO format): string[]
   * - answers (DTO format): Record<string, unknown>
   * - sections/exploredSections (legacy): Array<{ id, title, content }>
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateInfografiaInteractiva(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const minSections = 2;

    // Support DTO format: sections_explored as string[]
    const sectionsExploredDto = answers.sections_explored as string[] | undefined;

    // Support legacy format: sections or exploredSections as objects
    const sectionsLegacy = (answers.sections || answers.exploredSections || []) as Array<{
      id?: string;
      title?: string;
      content?: string;
    }>;

    // Determine section count based on available format
    let sectionsCount = 0;
    if (sectionsExploredDto && Array.isArray(sectionsExploredDto) && sectionsExploredDto.length > 0) {
      sectionsCount = sectionsExploredDto.length;
      metadata.inputFormat = 'dto';
    } else if (sectionsLegacy && Array.isArray(sectionsLegacy)) {
      sectionsCount = sectionsLegacy.length;
      metadata.inputFormat = 'legacy';
    }

    metadata.sectionsCount = sectionsCount;

    if (sectionsCount < minSections) {
      errors.push(
        `Debes explorar al menos ${minSections} secciones de la infografia. Actualmente has explorado ${sectionsCount}.`,
      );
      return;
    }

    // For DTO format, check if answers object has content
    if (sectionsExploredDto && answers.answers) {
      const answersObj = answers.answers as Record<string, unknown>;
      const answeredSections = Object.keys(answersObj).length;
      metadata.completedSections = answeredSections;
    } else {
      // For legacy format, validate sections have content
      const emptySections = sectionsLegacy.filter((section) => {
        return !section.content || section.content.trim().length === 0;
      });
      metadata.completedSections = sectionsLegacy.length - emptySections.length;

      if (emptySections.length > 0) {
        errors.push(
          `Todas las secciones exploradas deben tener contenido registrado. Tienes ${emptySections.length} seccion(es) sin contenido.`,
        );
      }
    }
  }

  /**
   * Validates quiz_tiktok exercise requirements
   *
   * @description Validates answers are within valid range
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateQuizTikTok(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const responses = (answers.responses || answers.answers || {}) as Record<
      string,
      number | string
    >;
    const responsesArray = Object.entries(responses);
    metadata.responsesCount = responsesArray.length;

    if (responsesArray.length === 0) {
      errors.push('Debes responder al menos una pregunta del quiz.');
      return;
    }

    // Validate each response is within valid range (0-3 for typical 4-option quiz)
    const invalidResponses = responsesArray.filter(([, value]) => {
      const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);
      return isNaN(numValue) || numValue < 0 || numValue > 3;
    });

    if (invalidResponses.length > 0) {
      errors.push(
        `Algunas respuestas tienen valores invalidos. Verifica tus selecciones.`,
      );
    }

    metadata.validResponses = responsesArray.length - invalidResponses.length;
  }

  /**
   * Validates navegacion_hipertextual exercise requirements
   *
   * @description Requires at least 3 nodes to be visited
   * Supports multiple input formats for backwards compatibility:
   * - path (DTO format): string[]
   * - information_found (DTO format): Record<string, unknown>
   * - visitedNodes/nodes (legacy): Array<{ id, title, timestamp }>
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateNavegacionHipertextual(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const minNodes = 3;

    // Support DTO format: path as string[]
    const pathDto = answers.path as string[] | undefined;
    const informationFound = answers.information_found as Record<string, unknown> | undefined;

    // Support legacy format: visitedNodes or nodes as objects
    const visitedNodesLegacy = (answers.visitedNodes || answers.nodes || []) as Array<{
      id?: string;
      title?: string;
      timestamp?: number;
    }>;

    // Determine visited nodes based on available format
    let visitedCount = 0;
    let uniqueNodes = new Set<string>();

    if (pathDto && Array.isArray(pathDto) && pathDto.length > 0) {
      visitedCount = pathDto.length;
      uniqueNodes = new Set(pathDto);
      metadata.inputFormat = 'dto';
      metadata.hasInformationFound = !!informationFound;
    } else if (visitedNodesLegacy && Array.isArray(visitedNodesLegacy)) {
      visitedCount = visitedNodesLegacy.length;
      uniqueNodes = new Set(visitedNodesLegacy.map((node) => node.id).filter(Boolean) as string[]);
      metadata.inputFormat = 'legacy';
    }

    metadata.visitedNodesCount = visitedCount;
    metadata.uniqueNodesVisited = uniqueNodes.size;

    if (visitedCount < minNodes) {
      errors.push(
        `Debes visitar al menos ${minNodes} nodos del hipertexto. Actualmente has visitado ${visitedCount}.`,
      );
      return;
    }

    // Check if user explored diverse content (not just clicking same node)
    if (uniqueNodes.size < minNodes) {
      errors.push(
        `Debes visitar al menos ${minNodes} nodos diferentes. Has visitado ${uniqueNodes.size} nodo(s) unico(s).`,
      );
    }

    // For DTO format, validate information_found has content
    if (informationFound && typeof informationFound === 'object') {
      const nodesWithInfo = Object.keys(informationFound).length;
      metadata.nodesWithInformation = nodesWithInfo;
    }
  }

  /**
   * Validates analisis_memes exercise requirements
   *
   * @description Requires at least 2 annotations
   * Supports multiple input formats for backwards compatibility:
   * - annotations (DTO format): Array<{ x, y, text }>
   * - analysis (DTO format): { message: string }
   * - annotations (legacy): Array<{ id, text, category }>
   *
   * @param answers - User answers
   * @param errors - Errors array (mutated)
   * @param metadata - Metadata object (mutated)
   */
  private validateAnalisisMemes(
    answers: Record<string, unknown>,
    errors: string[],
    metadata: Record<string, unknown>,
  ): void {
    const minAnnotations = 2;

    // Support DTO format: annotations with x, y, text
    const annotationsDto = answers.annotations as Array<{
      x?: number;
      y?: number;
      text?: string;
    }> | undefined;

    // Support DTO format: analysis with message
    const analysisDto = answers.analysis as { message?: string } | undefined;

    // Determine which format is being used
    let annotations: Array<{ text?: string }> = [];

    if (annotationsDto && Array.isArray(annotationsDto) && annotationsDto.length > 0) {
      annotations = annotationsDto;
      metadata.inputFormat = 'dto';
      metadata.hasAnalysisMessage = !!(analysisDto && analysisDto.message);
    } else {
      // Legacy format fallback
      const legacyAnnotations = (answers.annotations || []) as Array<{
        id?: string;
        text?: string;
        category?: string;
      }>;
      annotations = legacyAnnotations;
      metadata.inputFormat = 'legacy';
    }

    metadata.annotationsCount = annotations.length;

    if (annotations.length < minAnnotations) {
      errors.push(
        `Debes realizar al menos ${minAnnotations} anotaciones de analisis. Actualmente tienes ${annotations.length}.`,
      );
      return;
    }

    // Validate annotations have content
    const emptyAnnotations = annotations.filter((annotation) => {
      return !annotation.text || annotation.text.trim().length === 0;
    });

    if (emptyAnnotations.length > 0) {
      errors.push(
        `Todas las anotaciones deben tener contenido. Tienes ${emptyAnnotations.length} anotacion(es) vacia(s).`,
      );
    }

    metadata.completedAnnotations = annotations.length - emptyAnnotations.length;

    // Validate analysis message for DTO format
    if (analysisDto && (!analysisDto.message || analysisDto.message.trim().length === 0)) {
      errors.push('El análisis del meme debe incluir un mensaje de interpretación.');
    }
  }

  /**
   * Checks for anti-redundancy in completar_espacios exercises
   *
   * @description Exercise 1.3 requires spaces 5 and 6 to be different words
   *
   * @param answers - User answers
   * @returns RedundancyCheckResult
   */
  checkAntiRedundancy(answers: Record<string, unknown>): RedundancyCheckResult {
    const blanks = (answers.blanks || {}) as Record<string, string>;

    if (blanks['5'] && blanks['6']) {
      const space5 = String(blanks['5']).toLowerCase().trim();
      const space6 = String(blanks['6']).toLowerCase().trim();

      if (space5 === space6) {
        return {
          hasRedundancy: true,
          affectedFields: ['5', '6'],
          detectedValue: space5,
          message: `Los espacios 5 y 6 no pueden tener la misma palabra. Has puesto '${space5}' en ambos. Elige dos palabras DIFERENTES del grupo: ciencias, matematicas, fisica.`,
        };
      }
    }

    return { hasRedundancy: false };
  }

  /**
   * Checks if exercise requires manual grading
   *
   * @param exerciseId - Exercise ID
   * @returns true if manual grading required
   */
  async requiresManualGrading(exerciseId: string): Promise<boolean> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      select: ['requires_manual_grading'],
    });

    return exercise?.requires_manual_grading ?? false;
  }

  /**
   * Counts words in text content
   *
   * @param content - Text content
   * @returns Word count
   */
  countWords(content: unknown): number {
    if (typeof content !== 'string') return 0;
    return content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}
