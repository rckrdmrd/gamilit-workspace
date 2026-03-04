import {
  IsArray,
  IsBoolean,
  IsString,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * ClaimVerificationDto
 *
 * @description DTO para representar la verificación de una afirmación individual.
 * Contiene el ID de la afirmación, si es falsa o no, y la evidencia que lo respalda.
 */
export class ClaimVerificationDto {
  @ApiProperty({
    description: 'ID único de la afirmación verificada',
    example: 'claim_001',
  })
  @IsString({ message: 'claim_id must be a string' })
    claimId: string;

  @ApiProperty({
    description: 'Indica si la afirmación es falsa (fake news)',
    example: true,
  })
  @IsBoolean({ message: 'is_fake must be a boolean' })
    isFake: boolean;

  @ApiProperty({
    description: 'Evidencia que respalda la verificación (mínimo 10 caracteres)',
    example:
      'Según la OMS, no existe evidencia científica que respalde esta afirmación.',
    minLength: 10,
  })
  @IsString({ message: 'evidence must be a string' })
  @MinLength(10, {
    message: 'evidence must be at least 10 characters long',
  })
    evidence: string;
}

/**
 * VerificadorFakeNewsAnswerDto
 *
 * @description DTO para validar las respuestas del ejercicio "Verificador de Fake News".
 * El estudiante debe analizar múltiples afirmaciones y determinar cuáles son falsas,
 * proporcionando evidencia para cada verificación.
 *
 * @example
 * ```json
 * {
 *   "claims_verified": [
 *     {
 *       "claim_id": "claim_001",
 *       "is_fake": true,
 *       "evidence": "Según la OMS, no existe evidencia científica que respalde esta afirmación."
 *     },
 *     {
 *       "claim_id": "claim_002",
 *       "is_fake": false,
 *       "evidence": "Esta información está respaldada por múltiples fuentes verificadas."
 *     }
 *   ]
 * }
 * ```
 */
export class VerificadorFakeNewsAnswerDto {
  @ApiProperty({
    description:
      'Lista de afirmaciones verificadas por el estudiante (mínimo 1)',
    type: [ClaimVerificationDto],
    example: [
      {
        claim_id: 'claim_001',
        is_fake: true,
        evidence:
          'Según la OMS, no existe evidencia científica que respalde esta afirmación.',
      },
      {
        claim_id: 'claim_002',
        is_fake: false,
        evidence:
          'Esta información está respaldada por múltiples fuentes verificadas.',
      },
    ],
  })
  @IsArray({ message: 'claims_verified must be an array' })
  @ArrayMinSize(1, {
    message: 'claims_verified must contain at least one verification',
  })
  @ValidateNested({ each: true })
  @Type(() => ClaimVerificationDto)
    claimsVerified: ClaimVerificationDto[];
}
