import { IsArray, IsString, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Representa una conexión entre dos conceptos en el mapa
 */
class ConceptConnectionDto {
  @IsString()
  @IsNotEmpty()
    from!: string;

  @IsString()
  @IsNotEmpty()
    to!: string;

  @IsString()
  @IsOptional()
    label?: string;
}

/**
 * DTO para respuestas de ejercicio Mapa Conceptual
 *
 * @description Valida la estructura de conexiones entre conceptos
 * enviadas por el estudiante en ejercicios de mapa conceptual.
 *
 * Expected format:
 * {
 *   "connections": [
 *     { "from": "concept1", "to": "concept2", "label": "causa" },
 *     { "from": "concept2", "to": "concept3" }
 *   ]
 * }
 */
export class MapaConceptualAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptConnectionDto)
    connections!: ConceptConnectionDto[];
}
