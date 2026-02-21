import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Lenient UUID pattern: 8-4-4-4-12 hex format without version/variant bit enforcement.
 * Required because seed data uses sequential UUIDs (e.g. 80000001-...) that don't conform
 * to RFC 4122 version bits, and class-validator v0.14+ / validator.js v13.15+ reject them.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class EquipItemDto {
  @ApiProperty({
    description: 'UUID del item a equipar (debe haber sido comprado previamente)',
    example: '80000001-0001-0000-0000-000000000001',
  })
  @IsNotEmpty()
  @Matches(UUID_PATTERN, { message: 'item_id must be a valid UUID format' })
  item_id: string;
}
