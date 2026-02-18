import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EquipItemDto {
  @ApiProperty({
    description: 'UUID del item a equipar (debe haber sido comprado previamente)',
    example: '80000001-0001-0000-0000-000000000001',
  })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;
}
