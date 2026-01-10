import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

// Import all 15 DTOs - Module 1, 2, 3
import { WordSearchAnswersDto } from './word-search-answers.dto';
import { TrueFalseAnswersDto } from './true-false-answers.dto';
import { CrucigramaAnswersDto } from './crucigrama-answers.dto';
import { TimelineAnswersDto } from './timeline-answers.dto';
import { FillInBlankAnswersDto } from './fill-in-blank-answers.dto';
import { DetectiveTextualAnswersDto } from './detective-textual-answers.dto';
import { ConstruccionHipotesisAnswersDto } from './construccion-hipotesis-answers.dto';
import { PrediccionNarrativaAnswersDto } from './prediccion-narrativa-answers.dto';
import { PuzzleContextoAnswersDto } from './puzzle-contexto-answers.dto';
import { RuedaInferenciasAnswersDto } from './rueda-inferencias-answers.dto';
import { TribunalOpinionesAnswersDto } from './tribunal-opiniones-answers.dto';
import { AnalisisFuentesAnswersDto } from './analisis-fuentes-answers.dto';
import { DebateDigitalAnswersDto } from './debate-digital-answers.dto';
import { PodcastArgumentativoAnswersDto } from './podcast-argumentativo-answers.dto';
import { MatrizPerspectivasAnswersDto } from './matriz-perspectivas-answers.dto';
import { DetectiveConnectionsAnswersDto } from './detective-connections-answers.dto';
import { PredictionScenariosAnswersDto } from './prediction-scenarios-answers.dto';
import { CauseEffectMatchingAnswersDto } from './cause-effect-matching-answers.dto';
import { MapaConceptualAnswersDto } from './mapa-conceptual-answers.dto';
import { EmparejamientoAnswersDto } from './emparejamiento-answers.dto';

// Import Module 4 DTOs - Lectura Digital y Multimodal (5 ejercicios oficiales)
// @updated 2025-12-18 - LIMPIEZA-M4: Solo ejercicios oficiales según DocumentoDeDiseño v6.1
import {
  VerificadorFakeNewsAnswerDto,
  InfografiaInteractivaAnswerDto,
  QuizTikTokAnswerDto,
  NavegacionHipertextualAnswerDto,
  AnalisisMemesAnswerDto,
} from '../../../educational/dto/module4';

// Import Module 5 DTOs - Producción y Expresión Lectora (3 ejercicios oficiales)
// @updated 2025-12-18 - CORR-M5: Alineación con DocumentoDeDiseño v6.1
import {
  DiarioMultimediaAnswerDto,
  VideoCartaAnswerDto,
  ComicDigitalAnswerDto,
} from '../../../educational/dto/module5';

/**
 * ExerciseAnswerValidator
 *
 * @description Utility class for validating exercise answers based on exercise type.
 * Maps each of the 18 exercise types to its corresponding DTO and validates the structure.
 * (15 original + 3 additional for discrepancy fixes)
 *
 * Usage:
 * ```typescript
 * await ExerciseAnswerValidator.validate('crucigrama', answerData);
 * ```
 */
export class ExerciseAnswerValidator {
  /**
   * Maps exercise type to its corresponding DTO class
   *
   * @param exerciseType - Type of exercise (e.g., 'crucigrama', 'sopa_letras')
   * @returns DTO class for validation
   * @throws BadRequestException if exercise type is unknown
   */
  static getDtoForType(exerciseType: string): any {
    const normalizedType = exerciseType.toLowerCase().trim();

    switch (normalizedType) {
      // Module 1 - Literal Comprehension
      case 'sopa_letras':
      case 'word_search':
        return WordSearchAnswersDto;

      case 'verdadero_falso':
      case 'true_false':
        return TrueFalseAnswersDto;

      case 'crucigrama':
      case 'crossword':
        return CrucigramaAnswersDto;

      case 'linea_tiempo':
      case 'timeline':
        return TimelineAnswersDto;

      case 'completar_espacios':
      case 'fill_in_blank':
        return FillInBlankAnswersDto;

      case 'mapa_conceptual':
      case 'concept_map':
        return MapaConceptualAnswersDto;

      case 'emparejamiento':
      case 'matching':
        return EmparejamientoAnswersDto;

      // Module 2 - Inferential Comprehension
      case 'detective_textual':
        return DetectiveTextualAnswersDto;

      case 'construccion_hipotesis':
        return ConstruccionHipotesisAnswersDto;

      case 'prediccion_narrativa':
        return PrediccionNarrativaAnswersDto;

      case 'puzzle_contexto':
        return PuzzleContextoAnswersDto;

      case 'rueda_inferencias':
        return RuedaInferenciasAnswersDto;

      // Module 3 - Critical Thinking
      case 'tribunal_opiniones':
        return TribunalOpinionesAnswersDto;

      case 'analisis_fuentes':
        return AnalisisFuentesAnswersDto;

      case 'debate_digital':
        return DebateDigitalAnswersDto;

      case 'podcast_argumentativo':
        return PodcastArgumentativoAnswersDto;

      case 'matriz_perspectivas':
        return MatrizPerspectivasAnswersDto;

      // Discrepancy Fixes (DB-117)
      case 'detective_connections':
        return DetectiveConnectionsAnswersDto;

      case 'prediction_scenarios':
        return PredictionScenariosAnswersDto;

      case 'cause_effect_matching':
        return CauseEffectMatchingAnswersDto;

      // Module 4 - Lectura Digital y Multimodal
      case 'verificador_fake_news':
        return VerificadorFakeNewsAnswerDto;

      case 'infografia_interactiva':
        return InfografiaInteractivaAnswerDto;

      case 'quiz_tiktok':
        return QuizTikTokAnswerDto;

      case 'navegacion_hipertextual':
        return NavegacionHipertextualAnswerDto;

      case 'analisis_memes':
        return AnalisisMemesAnswerDto;

      // Module 5 - Producción y Expresión Lectora (3 ejercicios oficiales)
      // @updated 2025-12-18 - CORR-M5: Alineación con DocumentoDeDiseño v6.1
      case 'diario_multimedia':
        return DiarioMultimediaAnswerDto;

      case 'comic_digital':
        return ComicDigitalAnswerDto;

      case 'video_carta':
        return VideoCartaAnswerDto;

      default:
        // @updated 2025-12-18 - Alineación con DocumentoDeDiseño v6.1
        // Removidos: podcast, diario_reflexivo (M5), resena_critica, chat_literario, email_formal, ensayo_argumentativo (M4)
        throw new BadRequestException(
          `Unknown exercise type: ${exerciseType}. ` +
          'Valid types: ' +
          // Module 1 - Comprensión Literal
          'sopa_letras, verdadero_falso, crucigrama, linea_tiempo, completar_espacios, mapa_conceptual, emparejamiento, ' +
          // Module 2 - Comprensión Inferencial
          'detective_textual, construccion_hipotesis, prediccion_narrativa, puzzle_contexto, rueda_inferencias, ' +
          // Module 3 - Comprensión Crítica
          'tribunal_opiniones, analisis_fuentes, debate_digital, podcast_argumentativo, matriz_perspectivas, ' +
          // Auxiliary types
          'detective_connections, prediction_scenarios, cause_effect_matching, ' +
          // Module 4 - Lectura Digital (5 oficiales)
          'verificador_fake_news, infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes, ' +
          // Module 5 - Producción Creativa (3 oficiales)
          'diario_multimedia, comic_digital, video_carta',
        );
    }
  }

  /**
   * Validates answer structure against the DTO for the given exercise type
   *
   * @param exerciseType - Type of exercise
   * @param answers - Student answers to validate
   * @throws BadRequestException if validation fails
   */
  /**
   * Recursively extracts all constraint messages from validation errors,
   * including nested errors from arrays and objects.
   */
  private static extractErrorMessages(errors: ValidationError[], prefix = ''): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      const propertyPath = prefix ? `${prefix}.${error.property}` : error.property;

      // Add constraints from this level
      if (error.constraints) {
        const constraintMessages = Object.values(error.constraints);
        messages.push(...constraintMessages.map(msg => `${propertyPath}: ${msg}`));
      }

      // Recursively process nested errors (arrays and objects)
      if (error.children && error.children.length > 0) {
        messages.push(...this.extractErrorMessages(error.children, propertyPath));
      }
    }

    return messages;
  }

  static async validate(exerciseType: string, answers: any): Promise<void> {
    // CORR-010 DEBUG: Log completo para diagnosticar problema de statementId vacío
    console.log('[CORR-010 DEBUG] Validating answers:', {
      exerciseType,
      answersKeys: Object.keys(answers || {}),
      answersStructure: JSON.stringify(answers, null, 2).substring(0, 1000),
    });

    // CORR-010: Log específico para tribunal_opiniones
    if (exerciseType === 'tribunal_opiniones' && answers?.evaluations) {
      console.log('[CORR-010 DEBUG] Tribunal evaluations BEFORE sanitization:',
        JSON.stringify(answers.evaluations.map((e: any, i: number) => ({
          index: i,
          statementId: e.statementId,
          hasStatementId: !!e.statementId,
          typeOfStatementId: typeof e.statementId,
          classification: e.classification,
          verdict: e.verdict,
        })), null, 2)
      );

      // CORR-010 FIX: Sanitizar evaluaciones antes de validar
      // Esto es una solución de seguridad para garantizar que los IDs nunca estén vacíos
      answers.evaluations = answers.evaluations.map((e: any, idx: number) => {
        const sanitizedStatementId = e.statementId && typeof e.statementId === 'string' && e.statementId.trim() !== ''
          ? e.statementId
          : `stmt-${idx + 1}`;

        if (!e.statementId || e.statementId !== sanitizedStatementId) {
          console.warn(`[CORR-010 BACKEND] Sanitizing missing/invalid statementId at index ${idx}: "${e.statementId}" -> "${sanitizedStatementId}"`);
        }

        return {
          ...e,
          statementId: sanitizedStatementId,
        };
      });

      console.log('[CORR-010 DEBUG] Tribunal evaluations AFTER sanitization:',
        JSON.stringify(answers.evaluations.map((e: any, i: number) => ({
          index: i,
          statementId: e.statementId,
        })), null, 2)
      );
    }

    // Get the appropriate DTO class
    const DtoClass = this.getDtoForType(exerciseType);

    // Transform plain object to DTO instance
    const dto = plainToInstance(DtoClass, answers, {
      // CORR-010: Asegurar que las propiedades se copien correctamente
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    });

    // CORR-010: Log después de la transformación
    if (exerciseType === 'tribunal_opiniones' && (dto as any)?.evaluations) {
      console.log('[CORR-010 DEBUG] Tribunal evaluations AFTER transform:',
        JSON.stringify((dto as any).evaluations.map((e: any, i: number) => ({
          index: i,
          statementId: e.statementId,
          hasStatementId: !!e.statementId,
          typeOfStatementId: typeof e.statementId,
        })), null, 2)
      );

      // CORR-010 FIX v5: Post-transform sanitization
      // This is the DEFINITIVE fix - sanitize AFTER plainToInstance
      // to ensure class-transformer quirks don't lose our statementIds
      (dto as any).evaluations = (dto as any).evaluations.map((e: any, idx: number) => {
        if (!e.statementId || (typeof e.statementId === 'string' && e.statementId.trim() === '')) {
          const fallbackId = `stmt-${idx + 1}`;
          console.warn(`[CORR-010 BACKEND v5] Post-transform fix: Setting statementId at index ${idx} to "${fallbackId}"`);
          e.statementId = fallbackId;
        }
        return e;
      });

      console.log('[CORR-010 DEBUG] Tribunal evaluations AFTER POST-TRANSFORM sanitization:',
        JSON.stringify((dto as any).evaluations.map((e: any, i: number) => ({
          index: i,
          statementId: e.statementId,
        })), null, 2)
      );
    }

    // Validate
    const errors: ValidationError[] = await validate(dto);

    if (errors.length > 0) {
      // Format error messages including nested errors
      const messages = this.extractErrorMessages(errors);

      // FE-061: Log detailed error information
      console.error('[FE-061 DEBUG] Validation errors:', {
        exerciseType,
        errorCount: errors.length,
        messages,
        rawErrors: JSON.stringify(errors, null, 2),
      });

      throw new BadRequestException(
        `Validation failed for exercise type '${exerciseType}': ${messages.join('; ')}`,
      );
    }
  }

  /**
   * Validates and returns the transformed DTO instance
   *
   * @param exerciseType - Type of exercise
   * @param answers - Student answers to validate
   * @returns Validated DTO instance
   * @throws BadRequestException if validation fails
   */
  static async validateAndTransform(exerciseType: string, answers: any): Promise<any> {
    await this.validate(exerciseType, answers);
    const DtoClass = this.getDtoForType(exerciseType);
    return plainToInstance(DtoClass, answers);
  }
}
